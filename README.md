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
   git clone https://github.com/yourusername/progress-path.git
   cd progress-path

2. **Install Dependencies:**
    ```bash
    npm install

3. **Configure Environment Variables: Create a .env file in the root directory and add:**
    ```bash
    PORT=3000
    DATABASE_URL=postgres://username:password@localhost:5432/progress_path_db
    JWT_SECRET=your_jwt_secret
    AUTH0_DOMAIN=your-auth0-domain.auth0.com
    AUTH0_CLIENT_ID=your_auth0_client_id
    AUTH0_CLIENT_SECRET=your_auth0_client_secret
    AUTH0_CALLBACK_URL=http://localhost:3000/auth/auth0/callback

4. **Run Database Migrations:**
    ```bash
    npm run typeorm migration:run

5. **Start the Application:**
    ```bash
    npm run start:dev

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
  npm run test
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

3. **Commit your changes:**
    ```bash
    git commit -m 'Add some feature'

4. **Push to the branch:**
    ```bash
    git push origin feature/your-feature

5. **Open a Pull Request.**

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact:

- **Yulia Dubenchuk** dubenchuk6@gmail.com
- **GitHub:** Julia-Dubenchuk
