# collabDocs Backend

Backend service for collabDocs, built with NestJS, TypeScript, Fastify, and NestJS Observe.

## Requirements

- Node.js 24 or later
- npm
- Valid NestJS Observe credentials for local startup

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file from the template:

```bash
copy .env.example .env
```

Then set valid Observe credentials in `.env`:

```env
PORT=3000
NODE_ENV=development
APP_KEY=your_observe_app_key
APP_SECRET=your_observe_app_secret
SERVICE_ID=collabDocs_backend
```

`.env` is ignored by Git. Do not commit real credentials. The application reads these credentials once during startup, so restart the server after changing them.

## Running the Application

```bash
# Start normally
npm run start

# Start with file watching
npm run start:dev

# Start with the Node inspector
npm run start:debug

# Build and run the compiled application
npm run build
npm run start:prod
```

The server listens on `0.0.0.0` and uses port `3000` by default. Set `PORT` to use another port.

## Current API

| Method | Path | Response       |
| ------ | ---- | -------------- |
| `GET`  | `/`  | `Hello World!` |

The health module directory is reserved for the service health endpoint and is not exposed yet.

## Project Structure

```text
src/
├── common/              # Shared filters, guards, interceptors, and pipes
├── config/              # Environment validation and configuration factory
├── modules/health/      # Health feature area
├── app.controller.ts    # Root route
├── app.module.ts        # Root module and Observe setup
├── app.service.ts       # Root application service
└── main.ts              # Fastify bootstrap
test/                    # End-to-end tests
```

## Observability

The application uses `@nestjs/observe` for automatic instrumentation. `ObserveInstrument` is passed to `NestFactory.create`, allowing Nest request handlers and providers to generate traces.

The following environment variables configure Observe:

- `APP_KEY`: Observe application key
- `APP_SECRET`: Observe application secret
- `SERVICE_ID`: Service name shown in Observe; defaults to `collabDocs_backend`

Invalid or placeholder credentials result in a `401` telemetry rejection. Obtain credentials from the NestJS Observe dashboard before starting the application.

## Tests and Quality Checks

```bash
# Unit tests
npm test

# Watch tests during development
npm run test:watch

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Lint source and test files
npm run lint

# Format source and test files
npm run format
```

## License

This project is private and currently uses an `UNLICENSED` package license.
