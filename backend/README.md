# REST API Testing Suite — Backend

Production-grade REST API that powers the **REST API Testing Suite** dashboard.
Built with a clean, layered architecture (routes → controllers → services →
repositories) so business logic stays isolated, testable and easy to extend.

## Overview

The backend manages and monitors automated REST API testing. It exposes JSON
APIs for:

- **Auth** — register / login with JWT + bcrypt, protected routes.
- **Collections** — CRUD for Postman-style collections.
- **Executions** — run a collection (simulated Newman run) and query history.
- **Reports** — pass/fail counts, average response time, execution summaries.
- **Dashboard** — aggregated metrics computed from the database.
- **Docker** & **GitHub Actions** — mocked infrastructure status (ready to be
  swapped for real Docker Engine / GitHub REST integrations).

Every response follows a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }
// error
{ "success": false, "message": "...", "errors": [] }
```

## Tech Stack

Node.js · Express · TypeScript · PostgreSQL · Prisma ORM · JWT · bcrypt ·
Zod · Winston · Helmet · CORS · Morgan · dotenv · UUID · Swagger/OpenAPI · Docker

> Note: password hashing uses **bcryptjs** (a pure-JS, API-compatible bcrypt
> implementation) so the image builds without native compilation.

## Architecture

```
HTTP → middleware (helmet, cors, rate-limit, logger, validate, auth)
     → routes → controllers (thin)
     → services (business logic)
     → repositories (Prisma data access)
     → PostgreSQL
```

- **Controllers** are thin: parse the request, call a service, send the result.
- **Services** hold all business logic and throw typed `ApiError`s.
- **Repositories** are the only layer that touches Prisma.
- A **global error handler** normalizes `ApiError`, Zod, Prisma and JWT errors.

## Folder Structure

```
backend/
├── src/
│   ├── config/        # env, logger, prisma client, swagger
│   ├── controllers/   # thin HTTP handlers
│   ├── middleware/    # auth, validate, error, rateLimit, logger, notFound
│   ├── routes/        # express routers + root router
│   ├── services/      # business logic
│   ├── repositories/  # Prisma data access
│   ├── validators/    # Zod schemas
│   ├── utils/         # ApiError, ApiResponse, jwt, password, asyncHandler, id
│   ├── types/         # shared TypeScript types
│   ├── prisma/        # PrismaClient singleton
│   ├── seed/          # seed logic + compiled runner
│   ├── app.ts         # express app assembly
│   └── server.ts      # bootstrap + graceful shutdown
├── prisma/
│   ├── schema.prisma  # datasource + models
│   └── seed.ts        # `prisma db seed` entry point
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── package.json
├── tsconfig.json
└── .env.example
```

## Installation

```bash
cd backend
npm install
cp .env.example .env      # then edit values as needed
npm run prisma:generate   # generate the Prisma client
```

## Environment Variables

| Variable              | Description                                  | Default                        |
| --------------------- | -------------------------------------------- | ------------------------------ |
| `NODE_ENV`            | `development` \| `test` \| `production`      | `development`                  |
| `PORT`                | HTTP port                                    | `8080`                         |
| `CORS_ORIGIN`         | Comma-separated allowed origins              | `http://localhost:5173`        |
| `DATABASE_URL`        | PostgreSQL connection string                 | see `.env.example`             |
| `JWT_SECRET`          | Secret used to sign JWTs                     | —                              |
| `JWT_EXPIRES_IN`      | Token lifetime                               | `7d`                           |
| `BCRYPT_SALT_ROUNDS`  | bcrypt cost factor                           | `10`                           |
| `RATE_LIMIT_WINDOW_MS`| Rate-limit window                            | `900000`                       |
| `RATE_LIMIT_MAX`      | Max requests per window                      | `300`                          |
| `SEED_ADMIN_EMAIL`    | Seeded admin email                           | `admin@rats.dev`               |
| `SEED_ADMIN_PASSWORD` | Seeded admin password                        | `Admin@12345`                  |

## Run with Docker (recommended)

Brings up PostgreSQL + the backend. The backend waits for Postgres to become
healthy, pushes the Prisma schema, seeds the database, then starts.

```bash
cd backend
docker compose up --build
# API:  http://localhost:8080/api
# Docs: http://localhost:8080/api/docs
```

## Run locally (without Docker)

Requires a running PostgreSQL matching `DATABASE_URL`.

```bash
npm run prisma:push   # sync schema to the database
npm run seed          # insert dummy data
npm run dev           # start with hot reload (tsx watch)
```

Production build:

```bash
npm run build
npm start
```

## Database migration

```bash
npm run prisma:migrate   # create a dev migration (interactive)
npm run prisma:deploy    # apply migrations (CI/prod)
npm run prisma:push      # push schema without migration history
npm run prisma:studio    # open Prisma Studio
```

## Seed command

```bash
npm run seed
```

Inserts: **1 admin user, 5 collections, 20 executions, 100 request results, 20 reports.**

## API Endpoints

Base URL: `http://localhost:8080/api` (also served at `/api/v1`).

| Method | Endpoint                | Auth | Description                         |
| ------ | ----------------------- | ---- | ----------------------------------- |
| GET    | `/health`               | —    | Liveness probe                      |
| POST   | `/auth/register`        | —    | Create an account, returns JWT      |
| POST   | `/auth/login`           | —    | Log in, returns JWT                 |
| GET    | `/auth/me`              | ✅   | Current user profile                |
| GET    | `/collections`          | ✅   | List collections (search, paginate) |
| POST   | `/collections`          | ✅   | Create a collection                 |
| GET    | `/collections/:id`      | ✅   | Get a collection                    |
| PUT    | `/collections/:id`      | ✅   | Update a collection                 |
| DELETE | `/collections/:id`      | ✅   | Delete a collection                 |
| POST   | `/executions/run`       | ✅   | Run a collection                    |
| GET    | `/executions`           | ✅   | List executions                     |
| GET    | `/executions/:id`       | ✅   | Get an execution + results + report |
| GET    | `/reports`              | ✅   | List reports                        |
| GET    | `/reports/:id`          | ✅   | Get a report                        |
| GET    | `/dashboard`            | ✅   | Aggregated dashboard metrics        |
| GET    | `/docker`               | —    | Docker container status (mocked)    |
| GET    | `/github`               | —    | GitHub Actions runs (mocked)        |
| GET    | `/docs`                 | —    | Swagger UI                          |

**Auth flow:** `POST /auth/login` → copy `data.token` → send
`Authorization: Bearer <token>` on protected routes.

## Testing readiness (Postman / Newman)

Endpoints are designed for assertion testing: consistent status codes (200 /
201 / 400 / 401 / 404 / 409), a predictable response envelope, `responseTime`
fields, full CRUD, auth-required vs public routes, and structured error bodies.

## Future improvements

- Real Docker Engine integration (dockerode) for `/docker`.
- Real GitHub Actions integration for `/github`.
- WebSocket/SSE stream for live execution progress.
- Refresh tokens + role-based admin endpoints.
- Prisma migration history committed for reproducible deploys.
- Unit/integration test suite (Jest + Supertest) and a committed Newman suite.
