# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack ecommerce application built as a pnpm monorepo with three main packages:
- **Client**: React/TypeScript customer-facing frontend 
- **Backend**: Node.js/Express API server with MongoDB
- **AdminClient**: React/TypeScript admin dashboard (minimal setup)

## Development Commands

### Workspace-level Commands
```bash
# Run the main client application in development mode
pnpm dev

# Install dependencies across all workspaces
pnpm install
```

### Client (Customer Frontend)
```bash
# Development server (runs on port 8080)
pnpm --filter client dev

# Build for production
pnpm --filter client build

# Build for development
pnpm --filter client build:dev

# Lint code
pnpm --filter client lint

# Preview production build
pnpm --filter client preview
```

### Backend (API Server)
```bash
# Development server with auto-reload (runs on port 3001)
pnpm --filter backend dev

# Production server
pnpm --filter backend start
```

### AdminClient (Admin Dashboard)
```bash
# Development server
pnpm --filter adminclient dev

# Build for production
pnpm --filter adminclient build

# Lint code
pnpm --filter adminclient lint

# Preview production build
pnpm --filter adminclient preview
```

## Architecture Overview

### Backend Architecture

**Tech Stack**: Node.js, Express.js, MongoDB with Mongoose, ES Modules

**Key Patterns**:
- **MVC Structure**: Controllers handle business logic, Models define data schemas, Routers define API endpoints
- **Middleware-First**: Extensive use of Express middleware for auth, logging, error handling, rate limiting
- **Session-based Authentication**: Uses express-session with MongoDB store, plus JWT access/refresh tokens in httpOnly cookies
- **Centralized Error Handling**: All errors flow through a central errorHandler middleware
- **Request Context**: Each request gets a unique ID for structured logging via winston

**Directory Structure**:
- `Backend/backend/Controllers/`: Business logic for API endpoints
- `Backend/backend/Models/`: Mongoose schemas and data models
- `Backend/backend/Routers/`: Express route definitions (versioned under `/api/v1/`)
- `Backend/backend/Schemas/`: Zod validation schemas for request validation
- `Backend/backend/Middleware/`: Custom Express middleware (auth, errors, etc.)
- `Backend/backend/Utils/`: Shared utilities (tokens, logging, config)

**API Versioning**: All routes are prefixed with `/api/v1/`

**Key Middleware Stack**:
1. Request context tracking
2. Morgan logging (piped to Winston)
3. Helmet security headers
4. CORS (configured for localhost:8080)
5. Rate limiting
6. Session management
7. Cookie parsing
8. JSON body parsing

### Frontend Architecture

**Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS

**Key Libraries**:
- **Routing**: React Router v6 with nested routes
- **State Management**: Zustand for global state (auth, cart, wishlist)
- **Data Fetching**: TanStack Query (React Query) with axios
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

**State Management Pattern**:
- Zustand stores for global state (authStore, cartStore, wishlistStore)
- TanStack Query for server state and caching
- Local component state for UI-specific state

**Route Structure**:
- Public routes: home, products, product details, about, contact
- Protected routes: cart, checkout, profile, orders, wishlist
- Auth routes: login, signup, email verification, password reset

**Component Organization**:
- `src/pages/`: Page-level components
- `src/components/`: Reusable components
- `src/components/ui/`: shadcn/ui component library
- `src/store/`: Zustand state stores

**Development Server**: Runs on port 8080 with proxy to backend on port 3001

## Coding Guidelines

### Frontend Development Rules

**React/TypeScript Patterns**:
- Always use TypeScript with strict mode
- Keep routes in `src/App.tsx`
- Put source code in `src/` folder
- Organize pages in `src/pages/`, components in `src/components/`
- Main page is `src/pages/Index.tsx`
- Always update the main page to include new components for visibility

**Styling & UI**:
- Use Tailwind CSS extensively for all styling
- Utilize shadcn/ui components - all components and dependencies are pre-installed
- Don't edit shadcn/ui files directly - create new components if customization needed
- Use Lucide React for icons

**State Management**:
- Use Zustand for global state management
- Use TanStack Query for server state and API calls
- Use React Hook Form with Zod for form handling

### Backend Development Rules

**Node.js/Express Patterns**:
- Use ES Modules (`"type": "module"`)
- Always use the centralized errorHandler middleware
- Wrap async controller functions with the catchErrors utility
- Use Zod schemas for all request validation (located in `Backend/backend/Schemas/`)
- Use the pre-configured Winston logger for all server-side logging
- Keep business logic in Controllers, route definitions in Routers

**Database & Models**:
- Use Mongoose for MongoDB interactions
- Models are located in `Backend/backend/Models/`
- Always use model methods for operations like password comparison
- Sessions are stored in MongoDB with connect-mongo

**Authentication Pattern**:
- Session-based auth with express-session
- JWT access/refresh tokens stored in secure httpOnly cookies
- Use the requireAuth middleware for protected routes

## Development Environment

**Prerequisites**:
- Node.js with pnpm package manager
- MongoDB instance (configured via MONGO_URL in .env)
- Environment variables configured in `Backend/.env`

**Port Configuration**:
- Client development server: 8080
- Backend API server: 3001
- CORS configured to allow localhost:8080

**Database Seeding**:
- Backend automatically seeds mock products on first run if database is empty
- Order counter is initialized to start from 1000

## Testing

Currently no test framework is configured. The backend package.json has a placeholder test script that needs implementation.

## Important Notes

- Backend uses kill-port to clear port 3001 on development startup
- Client uses Vite with React SWC for fast development builds
- Session management uses MongoDB store for persistence
- All API routes are versioned under `/api/v1/`
- Authentication state is managed client-side via Zustand with server-side session validation
- Logging includes request IDs for tracing requests across the application
- The monorepo uses pnpm workspaces for dependency management
