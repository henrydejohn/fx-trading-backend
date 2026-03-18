FX Trading Backend Assessment
A robust, high-precision NestJS backend for currency trading, featuring multi-currency wallets, real-time FX rate integration, and atomic transaction handling.

Key Architectural Decisions

Clean Architecture (Hexagonal): The system is decoupled into Domain Entities, Repositories, and Use Cases to ensure the business logic is independent of the database and external frameworks.


Financial Precision: Built using Decimal.js and PostgreSQL NUMERIC(20, 6) to eliminate floating-point rounding errors during NGN/USD/EUR conversions.


Concurrency & Safety: Implemented Pessimistic Locking (SELECT FOR UPDATE) during wallet operations to prevent race conditions and double-spending.


Idempotency: All funding and trade operations require a unique reference check to prevent duplicate processing of the same transaction.


Asynchronous Processing: Integrated BullMQ and Redis to handle non-blocking tasks such as email verification (OTP) and background activity logging.


Tech Stack

Framework: NestJS (TypeScript) 
Database: PostgreSQL (for relational integrity and ACID compliance) 

ORM: TypeORM 

Cache/Queue: Redis & BullMQ 


Auth: JWT with Passport strategy and OTP verification 

Functional Coverage
[x] User Auth: Registration and email verification via OTP.

[x] Multi-Currency Wallet: Support for NGN, USD, EUR, etc., with atomic balance updates.

[x] Wallet Funding: Secure NGN funding with transaction logging.


⚙️ Setup & Installation
Prerequisites
Docker & Docker Compose

Node.js v18+ (if running locally)

Quick Start (Docker)
Clone the repository and navigate to the project root.

Run the following command:

The API will be available at http://localhost:3000.

Local Development
Install dependencies: npm install

Set up your .env file (see .env.example).

Run migrations: npm run migration:run

Start the app: npm run start:dev

API Endpoints (Brief)
Assumptions

Initial Balance: Users start with a zero balance upon verification until funded.
