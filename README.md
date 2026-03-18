# FX Trading Backend Assessment

A **high-precision financial backend** built with **NestJS** that
supports multi-currency wallets, atomic transactions, and real-time FX
rate integration.

The system is designed with **financial safety, concurrency protection,
and scalability** in mind.

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

The system follows **Clean Architecture (Hexagonal Architecture)** to
ensure business logic is independent of frameworks and infrastructure.

### Layer Responsibilities

**Domain** - Business entities - Enums - Repository interfaces

**Infrastructure** - Database implementations - External services
(Redis, Mail) - Queue processors

**Modules** - NestJS controllers - Dependency injection wiring - Business logic (use cases) - Orchestration of domain operations

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

# Assumptions

-   New users start with **zero wallet balance**
-   FX rates come from an external provider
-   Rates are cached in Redis
-   Database fallback ensures system uptime if FX API fails
-   Financial operations require **unique references**

------------------------------------------------------------------------

# Security Considerations

-   JWT Access + Refresh token strategy
-   Password hashing with bcrypt
-   Idempotent financial operations
-   Row-level locking for wallet updates

------------------------------------------------------------------------

# Possible Improvements

-   Ledger-based accounting model
-   Distributed rate limiting
-   WebSocket FX streaming
-   Audit event pipeline
-   Multi-region deployment

------------------------------------------------------------------------

# Final Notes

This implementation focuses on **financial safety, scalability, and
clean system design**, making it suitable as a foundation for a
**production FX trading backend**.
