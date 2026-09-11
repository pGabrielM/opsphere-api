# Opsphere API

![CI](https://github.com/pGabrielM/opsphere-api/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-TypeORM-4169E1?style=flat-square)

Backend for an internal operations workspace: a JWT-authenticated REST API that organizes
dashboards/panels into a **sector → category → subcategory → panel** hierarchy, so a team can
curate and browse the tools/links relevant to each area of the business.

## Why this project

A small but complete example of a typed Node.js API built directly on TypeORM (no framework
scaffolding), covering the parts that matter in a real backend: authentication, layered error
handling, data modeling with relations, and automated tests around the pieces that are worth
testing in isolation (auth, error mapping) rather than a low-value 100%-coverage exercise.

## Architecture

```
Request → routes.ts → [authMiddleware] → Controller → Repository (TypeORM) → PostgreSQL
                                              │
                                              ▼
                                     errorMiddleware (maps ApiError → HTTP status)
```

- **Controllers** (`src/controllers`) hold the request/response logic and stay free of SQL —
  they talk to repositories, never to the database driver directly.
- **Repositories** (`src/repositories`) are thin TypeORM repository instances per entity.
- **`ApiError` hierarchy** (`src/helpers/api-error.ts`): `BadRequestError`, `NotFoundError`,
  `UnauthorizedError` — thrown from anywhere in the request lifecycle and translated into the
  right HTTP status by a single `errorMiddleware`, so controllers never call `res.status(...)`
  for error paths.
- **`authMiddleware`** verifies the JWT, loads the user, strips the password hash, and attaches
  it to `req.user` for downstream handlers.
- **Migrations & seeds** (`src/migrations`, `src/seeds`) are TypeORM-managed, not manual SQL.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | — | Authenticates with `username`/`password`, returns the user and a JWT (8h expiry). |
| `POST` | `/user` | — | Creates a user (password hashed with bcrypt). |
| `GET` | `/profile` | ✅ | Returns the authenticated user (from the JWT). |
| `GET` | `/logout` | ✅ | Stateless logout acknowledgement. |
| `GET` | `/panel` | ✅ | Lists all panels. |
| `GET` | `/panel/:id` | ✅ | Fetches a single panel. |
| `POST` | `/panel` | ✅ | Creates a panel under a sector/category/subcategory. |
| `PATCH` | `/panel/:id` | ✅ | Updates a panel. |
| `DELETE` | `/panel/:id` | ✅ | Deletes a panel. |
| `GET` | `/sector` | ✅ | Lists sectors. |
| `GET` | `/category` | ✅ | Lists categories. |
| `POST` | `/category` | ✅ | Creates a sector, category or subcategory (`category_type`). |

## Running locally

```bash
cp .env.example .env       # set DB_* and JWT_PASS
npm install
npm run migration:run
npm run seed                # optional: seeds an initial user
npm run dev
```

## Tests & CI

```bash
npm test          # jest — unit tests for auth middleware and error handling
npm run lint       # tsc --noEmit
npm run build      # compiles to dist/
```

Every push/PR to `main` runs type-checking, tests and the production build via
[GitHub Actions](.github/workflows/ci.yml).

## Stack

TypeScript, Node.js, Express, TypeORM, PostgreSQL, JWT, bcrypt, Jest.
