# FX Trading Backend Assessment

A **high-precision financial backend** built with **NestJS** that
supports multi-currency wallets, atomic transactions, and real-time FX
rate integration.

The system is designed with **financial safety, concurrency protection,
and scalability** in mind.

> This system was built under a 48-hour constraint.
> Every decision in it reflects a deliberate prioritisation:
> get the financial safety primitives correct first,
> build features on top of a trustworthy foundation second.
> Incorrect money movement is worse than missing money movement.

------------------------------------------------------------------------

# Quick Summary

  Feature                  Implementation
  ------------------------ -------------------------------------------------
  Multi-currency wallets   NGN, USD, EUR
  Financial precision      PostgreSQL `NUMERIC(20,6)` + Decimal arithmetic
  Concurrency protection   Pessimistic row locking
  Duplicate protection     Idempotent transaction references
  Transaction history      Cursor-based pagination
  Background processing    Redis + BullMQ
  Email delivery           Resend + React Email
  Authentication           JWT Access + Refresh Tokens

------------------------------------------------------------------------

# Architecture Overview

The system follows Clean Architecture principles with three layers:

**Domain Layer** (`src/domain/`)
Pure business logic. Zero framework dependencies.
Entities, enums, typed exceptions, and repository interfaces live here.
A service can be extracted to a microservice without changing this layer.

**Infrastructure Layer** (`src/infrastructure/`)
Framework implementations. TypeORM repositories implement domain interfaces.
BullMQ workers, Redis service, and external API clients live here.
Swapping PostgreSQL for another database requires changes only in this layer.

**Modules Layer** (`src/modules/`)
NestJS HTTP delivery. Controllers translate HTTP requests into use case calls.
Services contain use cases — one method per operation.
Controllers contain zero business logic.

**Dependency Rule:**
Modules depend on domain interfaces.
Infrastructure implements those interfaces.
Domain depends on nothing.
This makes every use case independently unit testable
without spinning up a database or HTTP server.

------------------------------------------------------------------------

# Key Engineering Decisions

## Financial Precision

All financial values are stored as:

    NUMERIC(20,6)

This prevents floating-point rounding errors common in financial
systems.

------------------------------------------------------------------------

## Concurrency Safety

Wallet updates use **pessimistic row locking**.

    SELECT ... FOR UPDATE

This guarantees:

-   no race conditions
-   no double spending
-   safe concurrent updates

------------------------------------------------------------------------

## Idempotent Financial Operations

Each financial request includes a **unique transaction reference**.

A unique index ensures duplicate submissions cannot process twice.

    UNIQUE(reference)

This protects against:

-   retry storms
-   gateway callbacks
-   accidental duplicate requests

------------------------------------------------------------------------

## Cursor Pagination

Transaction history uses **cursor pagination** instead of offset
pagination.

Benefits:

-   constant performance
-   scalable for millions of records
-   avoids expensive OFFSET scans

Example:

    GET /transactions?limit=10&cursor=txn_123

------------------------------------------------------------------------

## Asynchronous Processing

Background tasks are handled using **BullMQ + Redis**.

Used for:

-   OTP emails
-   activity logging

Workers use a **handler-based job routing pattern** for extensibility.

------------------------------------------------------------------------

# Tech Stack

  Layer               Technology
  ------------------- ----------------
  Backend Framework   NestJS
  Language            TypeScript
  Database            PostgreSQL
  ORM                 TypeORM
  Queue               BullMQ
  Cache               Redis
  Auth                JWT + Passport
  Email               Resend API
  Email Templates     React Email
  Containerization    Docker

------------------------------------------------------------------------

# Running the Project

## Prerequisites

-   Node.js 20+
-   Docker
-   Docker Compose

------------------------------------------------------------------------

# Quick Start (Recommended)

Run the entire stack with Docker.

    docker compose up --build

Services started:

  Service    Address
  ---------- -----------------------
  API        http://localhost:3000
  Postgres   localhost:5432
  Redis      localhost:6379

------------------------------------------------------------------------

# Environment Setup

Create environment variables:

    cp .env.example .env

Docker uses internal service names:

    DB_HOST=postgres
    REDIS_HOST=redis

------------------------------------------------------------------------

# Local Development

Start infrastructure:

    docker compose up -d postgres redis

Install dependencies:

    npm install

Run migrations:

    npm run migration:run

Start development server:

    npm run start:dev

------------------------------------------------------------------------


# API Overview

## Authentication

  Method   Endpoint         Description
  -------- ---------------- -----------------------------
  POST     /auth/register/initiate    Begin Account Creation Flow and send OTP
  POST     /auth/register/verify-otp   Verify OTP and return Registration Token
  POST     /auth/register/complete      Complete Account Creation
  POST     /auth/login                    Authenticate with email and password, receive access and refresh tokens
  POST     /auth/refresh                   Exchange valid refresh token for new access token
  POST     /auth/logout                     Terminate session and revoke all active tokens

------------------------------------------------------------------------

## Wallet

  Method   Endpoint          Description
  -------- ----------------- ---------------------
  GET      /wallet           Get balances
  POST     /wallet/fund      Fund NGN wallet
  POST     /wallet/add       Add currency wallet

------------------------------------------------------------------------

## Transactions

  Method   Endpoint        Description
  -------- --------------- -------------------
  GET      /transactions   Paginated history

Example response:

``` json
{
  "data": [
    {
      "id": "txn_123",
      "amount": "1000.00",
      "currency": "NGN",
      "reference": "FUND-001"
    }
  ],
  "pageInfo": {
    "nextCursor": "txn_456",
    "hasNextPage": true
  }
}
```

------------------------------------------------------------------------

## FX Rates

  Method   Endpoint    Description
  -------- ----------- -------------------------
  GET      /fx/rates   Retrieve exchange rates

Rates are cached in Redis to reduce API calls.

------------------------------------------------------------------------

# Assumptions and Tradeoffs

## Financial model
Wallet balances are the operational hot layer for fast reads and
concurrent writes. A full double-entry ledger (append-only, immutable)
is the correct long-term model and is documented as the primary
architectural evolution path. Implementing it within the assessment
timeframe would have required sacrificing the concurrency and
precision work that matters more at this stage.

## FX rate freshness
Rates cached in Redis with a staleness flag. Conversions reject
requests when the cached rate exceeds the acceptable age threshold.
The database snapshot provides a fallback when Redis is unavailable.

## Session management 
Sessions expire on inactivity rather than fixed duration.
A fixed 7-day refresh token is unsafe for a financial platform —
a stolen token has days of valid access. Inactivity expiry limits
the attack window to the configured idle period.

## Currency conversion
The conversion endpoint architecture is designed and the
FX rate infrastructure is in place. Full implementation
was deprioritised to ensure the funded wallet, concurrency,
and precision work was correct first. Incorrect money movement
is worse than missing money movement.

------------------------------------------------------------------------

# Security Considerations

## Authentication
- 3-stage registration (Initiate → Verify OTP → Complete)
  prevents bot registrations and proves email ownership
  before a password is ever set
- JWT access tokens (short-lived)
- Refresh tokens stored as HMAC-SHA-256 hashes in PostgreSQL
  — raw token never persisted, hash is useless without server secret
- Session inactivity timeout — idle sessions expire automatically
  without requiring the user to explicitly log out
- Constant-time OTP comparison prevents timing attacks

## Financial Safety
- Pessimistic row locking (SELECT FOR UPDATE) on all balance mutations
- Idempotency keys with unique DB constraint prevent double processing
- All amounts stored as NUMERIC(20,6) — no floating point in the DB
- Decimal.js arithmetic for all calculations — zero rounding drift

------------------------------------------------------------------------

# What I Would Build Next

In priority order based on financial risk and product value:

**1. Currency Conversion Endpoint**
The FX rate infrastructure and wallet locking are already in place.
The conversion logic performs an atomic debit/credit using the locked
rate with Decimal.js precision.
Deprioritised to ensure the financial safety primitives were solid first.

**2. Double-Entry Ledger**
Replace mutable wallet balances with an append-only ledger_entries table.
Every balance change posts balanced DEBIT/CREDIT pairs.
wallet_balance becomes a materialised view for fast reads.
ledger_entries is the immutable source of truth.

**3. OTP Verification at Login**
Currently login uses email and password only.
OTP at login becomes an intrusion detection mechanism —
if an attacker uses stolen credentials, the real user
receives an OTP notification and knows immediately.
The OTP infrastructure built for registration is directly reusable.

**4. RabbitMQ for Microservice Extraction**
BullMQ is the correct choice for this monorepo.
At the point of microservice extraction, RabbitMQ becomes
the stable interface between services.
The domain layer and use cases require zero changes —
only the transport wrapper changes.
