# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev          # watch mode via nest CLI
npm run start:local        # ts-node-dev with hot reload (faster cold start)

# Build & lint
npm run build              # nest build → dist/
npm run lint               # ESLint with auto-fix
npm run format             # Prettier on src/ and test/

# Testing
npm run test               # unit tests (rootDir: src, matches **/*.spec.ts)
npm run test:watch         # watch mode
npm run test:cov           # with coverage
npm run test:e2e           # e2e suite in test/ (jest-e2e.json config)

# Run a single test file
npx jest src/lists/test/lists.service.spec.ts

# Database
npm run migration:generate -- --name MigrationName   # generate from entity diff
npm run migration:run      # apply pending migrations
npm run migration:revert   # roll back last migration
npm run seed               # run seeders (initial roles/users + sample data)

# Docker (dev)
npm run docker:up:dev      # build & start postgres + app
npm run docker:down:dev    # stop and remove containers
```

## Architecture

### Module structure

Every feature follows NestJS conventions: `entities/`, `dto/`, `*.controller.ts`, `*.service.ts`, `*.module.ts`, `test/`. Feature modules live under `src/<feature>/`.

Shared cross-cutting concerns live in `src/common/`:

- `logger/` — Winston via nest-winston; `LoggerService` wraps it and implements `NestLoggerService`
- `mailer/` — Nodemailer wrapper with HTML templates
- `authorization/` — `OwnershipAuthorizationService` for owner-or-admin checks
- `filters/` — `AllExceptionsFilter` (global; returns consistent JSON error shape)
- `enums/status.enum.ts` — shared `STATUS` enum (`planned | in progress | completed`)

### Database

- **ORM:** TypeORM with PostgreSQL
- **Entities auto-discovered:** `src/**/*.entity{.ts,.js}` at runtime; `src/**/entities/*.entity{.ts,.js}` for migrations CLI (`data-source.ts`)
- **`AppModule`** sets `synchronize: true` (dev convenience); **`data-source.ts`** sets `synchronize: false` (migrations are the source of truth for prod)
- **Seeding:** `typeorm-extension` + `@faker-js/faker`; factories in `src/database/factories/`, seeders in `src/database/seeders/`
- **User creation/update/deletion** use `QueryRunner` transactions to keep `UserProfile`, `UserPreference`, `SubscriptionDetail`, and `user_roles` consistent

### Authentication & authorization

Two auth strategies coexist:

- **JWT** (`JwtStrategy`) — email/password flow, tokens issued by `AuthService`
- **Auth0** (`Auth0Strategy`) — Google social login callback

Authorization is layered:

| Layer            | Mechanism                                                         | When to use                                     |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Role check       | `@ActionOnResource({ roles: [...] })`                             | Coarse-grained role gating                      |
| Permission check | `@ActionOnResource({ permissions: [...] })`                       | Fine-grained action gating                      |
| Policy check     | `@UseGuards(PoliciesGuard) @CheckPolicies(...)`                   | Dynamic CASL rules                              |
| Ownership check  | `OwnershipAuthorizationService.assertCanManageOwnResourceOrThrow` | User may only touch their own data unless Admin |

`@ActionOnResource` is a composite decorator that applies `JwtAuthGuard` plus optional `RolesGuard` / `PermissionsGuard`. Use it instead of stacking guards manually.

### Shared types

`IUpdateOperation<T>` (`src/types/update-operation.type.ts`) is the standard shape for service update methods that need current-user context:

```typescript
{
  currentUser: User;
  id: string;
  dto: T;
}
```

### Activity logging

`ActivityLogsService` provides two entry points:

- `create(dto)` — fire-and-forget (non-critical path); caller uses `void`
- `createTransactional(manager, dto)` — call inside an existing `QueryRunner` transaction when the log must be atomic with the business operation

### API documentation

Swagger is available at `/api` when the server is running.

### Pre-commit hooks

Husky runs lint-staged on commit: ESLint + Prettier on `*.ts`/`*.js`, Prettier on JSON/YAML/Markdown.
