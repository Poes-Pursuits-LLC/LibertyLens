# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Liberty Lens is a React Router v7 application built with TypeScript, featuring server-side rendering (SSR) and styled with Tailwind CSS v4. The project uses SST v3 (Serverless Stack) as its Infrastructure as Code (IaC) tool for AWS deployment.

## Common Development Commands

### Development

```bash
# Start React Router dev server with HMR on http://localhost:5173
npm run dev

# Start SST development mode with local stage
npm run local
```

### News Fetching

```bash
# Manually trigger news fetch (fetches from all active sources)
npm run fetch-now

# Seed database with limited fetch (10 sources max)
npm run seed
```

The news fetching system runs automatically every 15 minutes via AWS EventBridge cron job. Articles are fetched from RSS feeds and stored in DynamoDB.

### Testing

```bash
# Run unit tests
npm run unit-tests

# Run UI component tests
npm run ui-tests

# Run integration tests
npm run integration-tests

# Run end-to-end tests with Playwright
npm run e2e-tests
```

### Database Seeding

```bash
# Seed the database using SST shell
npm run seed
```

### Building & Production

```bash
# Build React Router application
npm run build

# Deploy with SST (specify stage)
npx sst deploy --stage production
```

## Infrastructure as Code with SST

SST v3 is used to manage AWS infrastructure. The configuration in `sst.config.ts` defines:

- **Application name**: `liberty-lens`
- **AWS as the cloud provider**: `home: "aws"`
- **Stage-based configuration**:
  - Production stage has removal protection (`retain`)
  - Non-production stages allow resource removal
- **React deployment**: Uses `sst.aws.React` construct for optimized React app deployment
- **News Fetching Cron**: Scheduled Lambda that runs every 15 minutes to fetch RSS articles

### SST Development Workflow

1. Run `npm run local` to start SST in development mode
2. SST creates local AWS resources for development
3. The `.sst/` directory contains generated types and local state (gitignored)
4. Use `npx sst shell` to run scripts with access to SST resources

## Architecture & Code Structure

### React Router v7 Setup

- **File-based routing**: Routes are defined in `app/routes.ts` using the new React Router v7 route configuration
- **Type-safe routes**: Generated types are created in `.react-router/types/` (gitignored)
- **SSR by default**: Configured in `react-router.config.ts` with `ssr: true`

### Key Directories

- `app/`: Main application code
  - `root.tsx`: Root layout component with error boundary
  - `routes.ts`: Route configuration using `@react-router/dev/routes`
  - `routes/`: Route components (currently only `home.tsx`)
  - `welcome/`: Reusable components
  - `app.css`: Global styles with Tailwind CSS v4 imports
  - `e2e.spec.ts`: End-to-end test specifications

### Build Output Structure

```
build/
├── client/    # Static assets for client-side
└── server/    # Server-side rendering code
```

### Important Configuration Files

- `vite.config.ts`: Vite configuration with React Router plugin, Tailwind CSS, and TypeScript path mapping
- `react-router.config.ts`: React Router specific configuration
- `tsconfig.json`: TypeScript config with path aliases (`~/*` maps to `./app/*`)
- `sst.config.ts`: SST infrastructure configuration for AWS deployment

### Testing Structure

The project is configured for multiple testing strategies:

- **Unit tests**: Test individual functions and utilities
- **UI tests**: Test React components in isolation
- **Integration tests**: Test feature workflows
- **E2E tests**: Test full user journeys with Playwright

### Styling

- Uses Tailwind CSS v4 with the new `@tailwindcss/vite` plugin
- Custom theme variables defined in `app.css` using `@theme`
- Dark mode support with `prefers-color-scheme`

### Type Safety

- Route types are imported from `./+types/[route-name]` in each route file
- SST generates types for infrastructure resources in `.sst/platform/config.d.ts`

## Extreme Programming Practices

### 1. Write the Simplest Code That Works

- Start with the minimal implementation that satisfies the requirement
- Avoid premature optimization or over-engineering
- Refactor only when complexity emerges through actual usage

### 2. Test-First Development

- Write tests before implementing features
- Tests serve as living documentation
- Test file structure should mirror the source structure:
  ```
  app/
  ├── components/
  │   ├── Button.tsx
  │   └── Button.test.tsx
  ├── utils/
  │   ├── format.ts
  │   └── format.test.ts
  ```

### 3. Method Extraction and Module Creation

- Compose logic using small, focused methods
- When a method is used more than once, extract it to its own module
- Each extracted module must have its own test file

Example workflow:

```typescript
// Step 1: Initial implementation in component
// app/routes/home.tsx
function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Step 2: When used in another component, extract to module
// app/utils/format.ts
export function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// app/utils/format.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats currency with 2 decimal places", () => {
    expect(formatPrice(10)).toBe("$10.00");
    expect(formatPrice(10.5)).toBe("$10.50");
  });
});
```

### 4. Testing Guidelines

- Test names should describe behavior, not implementation
- Group related tests using `describe` blocks
- Each test should verify one specific behavior
- Tests should be independent and not rely on execution order

## Development Workflow

1. Start SST dev environment: `npm run local`
2. Run relevant test suite during development
3. Use `npx sst shell` for scripts that need AWS resource access
4. Deploy to staging/production using SST

## News Fetching Architecture

### Components

1. **RSS Fetcher** (`app/core/article/rss-fetcher.ts`)
   - Parses RSS feeds using `rss-parser` library
   - Handles various RSS formats and edge cases
   - Extracts images from media tags and content
   - Returns normalized article data

2. **Fetch Worker** (`app/workers/fetch-news.handler.ts`)
   - Lambda function triggered by cron schedule
   - Fetches active news sources with concurrency control (5 parallel)
   - Saves new articles to DynamoDB
   - Updates source reliability scores

3. **Services**
   - `newsSourceService`: Manages news sources and reliability tracking
   - `articleService`: Handles article storage and retrieval

### Default News Sources

- **Libertarian**: Reason Magazine, Mises Institute, Liberty Fund
- **Mainstream**: Reuters, BBC News
- **Alternative**: The Intercept
- **Financial**: Zero Hedge
- **Tech**: Ars Technica

### Monitoring

- CloudWatch logs capture fetch statistics
- Source reliability scores (0-100) track success rates
- Sources below 30 score are automatically disabled

## Key Dependencies

- React 19.1.0 with React Router 7.7.1
- Vite 6.3.3 for development and building
- Tailwind CSS 4.1.4 for styling
- TypeScript 5.8.3 for type safety
- SST 3.17.10 for AWS infrastructure management
- RSS Parser 3.13.0 for RSS feed parsing
- Vitest for testing framework (when configured)
- Playwright for E2E testing (when configured)
