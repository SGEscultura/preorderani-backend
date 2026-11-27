# PreOrderAni Backend

Backend RESTful API for **PreOrderAni**, a web-based harvest pre-order platform that connects local farmers directly with consumers[cite: 5, 7].

## Tech Stack
- Framework: NestJS (TypeScript, CommonJS)
- ORM & Database: Prisma ORM + PostgreSQL (Neon)
- Authentication & Validation: JWT, bcrypt, class-validator
- API Documentation: Swagger (`/api/docs`)
- Testing: Jest, Postman[cite: 7, 25, 26, 27]

## Architecture & Folder Structure
The backend follows a **Modular Monolith with Layered Separation** (`Controller` -> `Service` -> `Repository` via Prisma)[cite: 7]:

preorderani-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── common/          # Shared guards, filters, decorators
│   ├── auth/            # Register, login, JWT
│   ├── users/           # User profile management
│   ├── crops/           # Crops, units, and payment methods lookups
│   ├── harvests/        # Harvest listings and status updates
│   ├── pre-orders/      # Pre-order creation, confirmation, cancellation
│   ├── payments/        # Payments, payment logs, and invoices
│   ├── app.module.ts
│   └── main.ts
├── test/                # Jest tests
├── .env.example
└── package.json[cite: 8]

## Getting Started

### 1. Install Dependencies
Run `npm install` in the project root[cite: 8].

### 2. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example` with `DATABASE_URL` and `JWT_SECRET`[cite: 8, 25, 33].

### 3. Run Database Migrations
Run `npx prisma migrate dev` and `npx prisma generate` to apply migrations and generate the Prisma client[cite: 8, 32].

### 4. Run the Application
Use `npm run start`, `npm run start:dev`, or `npm run start:prod` to run the NestJS server, then open `/api/docs` for Swagger API documentation[cite: 26].

## Run Tests
Run Jest tests using `npm run test`, `npm run test:e2e`, or `npm run test:cov`[cite: 8, 27].

## Git Branching Workflow
- `main` — stable, deployable production code
- `develop` — integration branch for testing features
- `feature/<module-name>` — feature branches merged into `develop` via pull request[cite: 26]

## Team
- **Figuron, Sophia Gabrielle E.** — Backend Development
- **Mala, Aliah Levi C.** — Backend Development[cite: 4, 31]

Caraga State University — College of Computing and Information Sciences (ITE 18: Applications Development and Emerging Technologies)[cite: 4].