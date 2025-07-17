# Progress Path

Progress Path is a personal tracker and planner application built with NestJS and Node.js. It empowers users to monitor their progress, mood, goals, and learning journeys. With flexible content management, role-based access control, and premium subscription features, Progress Path offers a holistic approach to personal development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Docker Setup](#docker-setup)
- [Logging](#logging)
- [Error Handling](#error-handling)

## Features

- **User Registration & Authentication**
  - Traditional sign-up using email/password.
  - Social login via Google with Auth0.
  - JWT-based authentication and session management.
- **Role-Based Access Control (RBAC)**
  - Flexible role management with support for multiple roles per user.
  - Fine-grained access control with permissions.
- **Content Management**
  - Create and manage lists of items (e.g., movies, books, articles, TV shows).
  - Prioritize items and track status (e.g., planned, in progress, completed).
- **Mood Tracking**
  - Record daily mood entries with a date field.
  - View mood trends over time with calendar integration.
- **Goal Setting & Tracking**
  - Set big goals and break them into smaller, actionable steps.
  - Visualize progress with progress bars.
- **Learning & Skill Tracking**
  - Monitor learning progress and skill improvement.
  - Visualize progress through charts and graphs.
- **Premium Features**
  - Differentiate between simple and premium users.
  - Manage subscriptions for access to advanced features.

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** Auth0 (Google Login)
- **ORM:** TypeORM
- **Testing:** Jest
- **Documentation:** Swagger
- **Dev Tools:** ESLint, Prettier, Husky

## Installation

### Prerequisites

- Node.js (>=14.x)
- npm (>=6.x)
- PostgreSQL (Ensure you have a running instance)

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Julia-Dubenchuk/progress-path.git
   cd progress-path

   ```

2. **Install Dependencies:**

   ```bash
   npm install

   ```

3. **Configure Environment Variables: Create a .env file in the root directory and add:**

   ```bash
   PORT=3000
   DATABASE_URL=postgres://username:password@localhost:5432/progress_path_db
   JWT_SECRET=your_jwt_secret
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   AUTH0_CALLBACK_URL=http://localhost:3000/auth/auth0/callback

   ```

4. **Run Database Migrations:**

   ```bash
   npm run typeorm migration:run

   ```

5. **Start the Application:**
   ```bash
   npm run start:dev
   ```

The server will run on http://localhost:3000.

## Environment Variables

Ensure your `.env` file includes:

- **PORT**: Server port.
- **DATABASE_URL**: PostgreSQL connection string.
- **JWT_SECRET**: Secret key for JWT authentication.
- **AUTH0_DOMAIN**, **AUTH0_CLIENT_ID**, **AUTH0_CLIENT_SECRET**, **AUTH0_CALLBACK_URL**: For Auth0 configuration to enable Google login.

## Usage

### Authentication

Use the `/auth` endpoints for user registration, login, and Auth0-based Google social login.

### Content Management

Manage lists and items via the provided API endpoints.

### Mood & Goal Tracking

Record mood entries and set goals, with endpoints for creating, updating, and viewing progress.

## Testing

To run tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Tests are built using Jest and can be found within the src directory.

## API Documentation

Swagger documentation is integrated. After starting the server, access it at:

```bash
http://localhost:3000/api
```

## Contributing

Contributions are welcome! Follow these steps:

1. **Fork the repository.**
2. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature

   ```

3. **Commit your changes:**

   ```bash
   git commit -m 'Add some feature'

   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/your-feature

   ```

5. **Open a Pull Request.**

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact:

- **Yulia Dubenchuk:** dubenchuk6@gmail.com
- **GitHub:** Julia-Dubenchuk

## Role-Based Access Control (RBAC)

The application implements a comprehensive Role-Based Access Control (RBAC) system with multiple layers of authorization:

### 1. Role-Based Protection

Users are assigned roles (Admin, Premium, User) which determine their access levels.

```typescript
@ActionOnResource({ roles: [RoleName.ADMIN] })
create(@Body() createItemDto: CreateItemDto) {
  // Only admins can access this endpoint
}
```

### 2. Permission-Based Protection

Finer-grained control through specific permissions (create-list, edit-item, delete-user).

```typescript
@ActionOnResource({ permissions: [Action.EDIT_ITEM] })
findAll() {
  // Only users with edit-item permission can access this endpoint
}
```

### 3. Policy-Based Protection

Complex access rules using CASL abilities for dynamic permission checking.

```typescript
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.EDIT_ITEM, 'all'))
findOne(@Param('id') id: string) {
  // Uses CASL to evaluate complex permission rules
}
```

### 4. Combined Protection Strategies

Combining roles and permissions for more complex authorization scenarios.

```typescript
@ActionOnResource({
  roles: [RoleName.ADMIN, RoleName.PREMIUM],
  permissions: [Action.EDIT_ITEM],
  requireAll: true,
})
update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
  // User must have BOTH a required role AND the specific permission
}
```

## Pre-commit Hooks

This project uses Husky and Lint-Staged to enforce code quality checks before commits:

- **Husky**: Sets up Git hooks
- **Lint-Staged**: Runs linters on staged files

When you commit changes, the pre-commit hook automatically:

1. Runs ESLint to catch code issues
2. Formats code with Prettier

This ensures that all committed code follows project standards.

## Docker Setup

The project is fully Dockerized for easy setup and deployment.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. **Environment Configuration:**

   Copy the sample environment file:

   ```bash
   cp .env.docker .env
   ```

   Adjust any variables as needed for your environment.

2. **Build and start all services:**

   ```bash
   docker-compose up -d
   ```

3. **View logs:**

   ```bash
   docker-compose logs -f
   ```

4. **Stop all services:**

   ```bash
   docker-compose down
   ```

### Development vs Production

- The default Docker setup is for development with hot-reloading enabled.
- For production, use the production-specific docker-compose file:

  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

### Database Persistence

PostgreSQL data is persisted in a Docker volume. To reset the database, remove the volume:

```bash
docker-compose down -v
```

### Initial Database Setup

When running for the first time, you may need to run migrations inside the Docker container:

```bash
docker-compose exec app npm run migration:run
```

## Logging

### Overview

This application uses Winston as a logging library integrated via the `nest-winston` module to provide structured, level-based, and environment-aware logging.

### Logger Configuration

The logger is configured in `src/common/logger/logger.config.ts` using a factory function `createWinstonConfig`, which sets up different transports based on the environment.

Environment variables (in your `.env`):

```env
# Logging
NODE_ENV=development        # or "production"
LOG_LEVEL=debug             # one of: error, warn, info, http, verbose, debug, silly
```

In development mode:

- Logs are printed to the console in a human-readable, colorized console output.

In production mode:

- Console logs are formatted as JSON.
- Two files are created in the `logs/` folder:
  - `error.log`: Logs all error-level messages.
  - `combined.log`: Logs all messages with level `info` and above.

### Logger Module

A custom `LoggerModule` is created in `src/common/logger/logger.module.ts` which imports and provides the `WinstonModule` globally.

### Usage in Controllers/Services

A custom LoggerService wraps Winston and implements Nest’s built-in LoggerService interface.

```typescript
// Inject it in any controller or service
constructor(private readonly logger: LoggerService) {}

// Log an "info" message
this.logger.log('User login', { meta: { userId: 123 }, context: MyController.name });

// Log a warning
this.logger.warn('Missing profile field', { meta: { field: 'bio' }, context: MyService.name });

// Log an error with optional stack trace
this.logger.error('Failed to save item', { meta: { stack: error.stack }, context: MyController.name });
```

### Passing Meta Information

To pass additional meta information:

```typescript
this.logger.log('User created', { meta: { userId: 123, role: 'admin' } });
```

### File Management

Make sure to add the `logs/` folder to your `.gitignore` file to avoid committing log files to version control.

## Error Handling

All unhandled exceptions in the application are caught by a global exception filter, `AllExceptionsFilter`, ensuring a consistent, user-friendly JSON error response across every endpoint. This filter also logs detailed error metadata via the custom Winston-based `LoggerService`.

### JSON Error Schema

| Field                                                                                                                                 | Type   | Description                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `timestamp`                                                                                                                           | string | ISO‑formatted timestamp when the error occurred.                                                           |
| `path`                                                                                                                                | string | Request URL path where the error was thrown.                                                               |
| `method`                                                                                                                              | string | HTTP method (e.g. `GET`, `POST`) used in the request.                                                      |
| `message`                                                                                                                             | string |                                                                                                            |
| User‑friendly error message. For HTTP exceptions, this reflects the exception response; otherwise, a generic "Internal server error". |        |                                                                                                            |
| `stack`                                                                                                                               | string | _(Development only)_ Full error stack trace. Included when `NODE_ENV !== 'production'`.                    |
| `errorId`                                                                                                                             | string | _(Production only)_ Unique UUID for tracing this error in logs. Included when `NODE_ENV === 'production'`. |

**Example Response (Development)**

```json
{
  "timestamp": "2025-06-18T16:45:32.123Z",
  "path": "/api/users/42",
  "method": "GET",
  "message": "User not found",
  "stack": "Error: User not found\n    at UsersService.findOne..."
}
```

**Example Response (Production)**

```json
{
  "timestamp": "2025-06-18T16:45:32.123Z",
  "path": "/api/users/42",
  "method": "GET",
  "message": "User not found",
  "errorId": "3f4a1a2b-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
}
```

> All other exceptions (e.g. uncaught JS errors, validation failures) follow this same schema.
