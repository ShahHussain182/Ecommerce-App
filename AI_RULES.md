# AI_RULES.md

This document outlines the technical stack, architectural patterns, and coding guidelines for the E-Store application, intended for AI assistance.

## Project Overview

This is a full-stack e-commerce application built as a pnpm monorepo with three main packages:
- **Client**: React/TypeScript customer-facing frontend
- **Backend**: Node.js/Express API server with MongoDB
- **AdminClient**: React/TypeScript admin dashboard

## General Guidelines

- **Language:** Always reply to the user in the same language they are using.
- **Completeness:** Implement features fully; avoid partial implementations, placeholders, or TODO comments.
- **Efficiency:** Make efficient and effective changes, prioritizing simplicity and elegance.
- **Code Quality:** Ensure code is complete, syntactically correct, and follows existing coding style and conventions.
- **File Structure:** Create new files for every new component or hook, no matter how small. Avoid adding new components to existing files.
- **Responsiveness:** Always generate responsive designs using Tailwind CSS.
- **Error Handling:** Do not use `try/catch` blocks unless specifically requested. Errors should be thrown to bubble up for centralized handling.
- **Scope:** Do not over-engineer or implement features beyond the user's explicit request.

## Frontend Tech Stack (Client)

-   **Core:** React 18, TypeScript, Vite.
-   **Styling:** Tailwind CSS (extensively for all styling), shadcn/ui (pre-installed, do not edit source files; create new components for customization).
-   **UI Primitives:** Radix UI (pre-installed).
-   **Routing:** React Router v6 (routes kept in `src/App.tsx`).
-   **State Management:**
    -   **Global Client State:** Zustand (`src/store/authStore.ts`, `src/store/cartStore.ts`, `src/store/wishlistStore.ts`).
    -   **Server State & Caching:** TanStack Query (`src/hooks/`).
-   **Forms:** React Hook Form with Zod validation.
-   **API Interaction:** Axios (`src/lib/api.ts`) with interceptors for global error handling (e.g., 401 Unauthorized).
-   **Icons:** Lucide React.
-   **Animations:** Framer Motion.
-   **Toasts/Notifications:** Sonner (`src/utils/toast.ts`).
-   **Phone Number Input:** `react-phone-number-input`.
-   **UI Components:** `src/components/ui/` contains shadcn/ui components.
-   **File Organization:**
    -   `src/pages/`: Page-level components (e.g., `Index.tsx`, `ProductDetail.tsx`).
    -   `src/components/`: Reusable components (e.g., `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`).
    -   `src/hooks/`: Custom React hooks for data fetching and logic.
    -   `src/lib/`: API service files (`authApi.ts`, `productApi.ts`, `cartApi.ts`, `wishlistApi.ts`, `reviewApi.ts`, `orderApi.ts`, `categoryApi.ts`).
    -   `src/utils/`: Utility functions (`cartUtils.ts`, `toast.ts`).
-   **Main Page:** `src/pages/Index.tsx` is the default page and should be updated to include new components for visibility.

## Frontend Tech Stack (AdminClient)

-   **Core:** React 18, TypeScript, Vite.
-   **Styling:** Tailwind CSS (extensively for all styling), shadcn/ui (pre-installed, do not edit source files; create new components for customization).
-   **UI Primitives:** Radix UI (pre-installed).
-   **Routing:** React Router v6 (`AdminClient/src/App.tsx`), `ProtectedRoute` for access control, `AuthInitializer` for session validation.
-   **State Management:**
    -   **Global Client State:** Zustand (`AdminClient/src/store/authStore.ts`).
    -   **Server State & Caching:** TanStack Query (`AdminClient/src/hooks/`).
-   **Forms:** React Hook Form with Zod validation.
-   **API Interaction:** Axios (`AdminClient/src/lib/api.ts`) with interceptors for global error handling (e.g., 401 Unauthorized, admin role check).
-   **Icons:** Lucide React.
-   **Charts:** Recharts (`AdminClient/src/components/charts/`).
-   **Toasts/Notifications:** `react-hot-toast`.
-   **Debouncing:** `use-debounce` for search inputs.
-   **File Organization:**
    -   `AdminClient/src/pages/`: Admin dashboard pages (e.g., `Dashboard.tsx`, `Products.tsx`, `Orders.tsx`, `Categories.tsx`).
    -   `AdminClient/src/components/`: Reusable components, organized by feature (e.g., `layout/`, `auth/`, `charts/`, `dashboard/`, `orders/`, `products/`).
    -   `AdminClient/src/services/`: API service files (`authService.ts`, `productService.ts`, `orderService.ts`, `customerService.ts`, `reviewService.ts`, `categoryService.ts`, `reportService.ts`).
    -   `AdminClient/src/schemas/`: Zod schemas for form validation.
-   **Authentication:** Admin access is strictly enforced via `ProtectedRoute` and `AuthInitializer` which checks for `user.role === 'admin'`.

## Backend Tech Stack

-   **Core:** Node.js, Express.js, JavaScript (ES Modules).
-   **Database:** MongoDB with Mongoose for ODM (`Backend/backend/Models/`).
-   **Validation:** Zod for all incoming request body and parameter validation (`Backend/backend/Schemas/`).
-   **Authentication:**
    -   Session-based authentication managed by `express-session` with `connect-mongo` store.
    -   Access and Refresh tokens (JWTs) are used and stored in secure, `httpOnly` cookies.
    -   Redis (`ioredis`) is used for refresh token management (storage and blacklisting).
    -   Middleware: `requireAuth` for general authentication, `requireAdmin` for admin-specific routes.
-   **Error Handling:**
    -   Centralized `errorHandler` middleware (`Backend/backend/Middleware/errorHandler.js`).
    -   `catchErrors` utility to wrap async controller functions (`Backend/backend/Utils/catchErrors.js`).
-   **Logging:**
    -   Winston logger for structured, leveled logging (`Backend/backend/Utils/logger.js`).
    -   `requestContextMiddleware` for adding a unique `requestId` to each request for tracing.
    -   Morgan integration for HTTP request logging piped into Winston.
-   **Search:** Meilisearch for product search and autocomplete (`Backend/backend/Utils/meilisearchClient.js`, `Backend/backend/scripts/syncMeili.js`).
-   **File Storage:** MinIO (S3-compatible object storage) using `@aws-sdk/client-s3` for image uploads and deletions (`Backend/backend/Utils/s3Client.js`, `Backend/backend/Utils/s3Upload.js`, `Backend/backend/Utils/multerConfig.js`).
-   **Email:** Mailtrap for email sending (`Backend/backend/mailtrap/`).
-   **Utilities:**
    -   `bcrypt` for password hashing (`Backend/backend/Utils/bcrypt.js`).
    -   `jsonwebtoken` for JWT generation (`Backend/backend/Utils/generateTokens.js`).
    -   `setCookie` for cookie management (`Backend/backend/Utils/setCookie.js`).
    -   `date` for date utilities (`Backend/backend/Utils/date.js`).
    -   `verificationCodeType` for constants (`Backend/backend/Constants/verificationCodeType.js`).
-   **Architecture:**
    -   **MVC Structure:** Business logic in `Controllers`, data schemas in `Models`, API endpoints in `Routers`.
    -   **Middleware-First:** Extensive use of Express middleware.
    -   **API Versioning:** All routes are prefixed with `/api/v1/`.
-   **Database Seeding:** Mock products and categories are seeded on first run if the database is empty (`Backend/backend/server.js`). An order number counter is also initialized.
-   **Graceful Shutdown:** Implemented for clean server termination.

## Coding Guidelines

-   **File Naming:** Directory names MUST be all lower-case (e.g., `src/pages`, `src/components`). File names may use mixed-case (e.g., `ProductCard.tsx`).
-   **Component Size:** Aim for components that are 100 lines of code or less. Be ready to refactor large files.
-   **Code Formatting:** Always use `<dyad-write>` tags for all code output. Never use markdown code blocks (```).
-   **Imports:** Review all import statements. Ensure first-party imports refer to existing files. Install third-party packages with `<dyad-add-dependency>` if not in `package.json`.
-   **Frontend Specifics:**
    -   Use shadcn/ui components where applicable.
    -   Utilize Tailwind CSS classes for styling.
    -   Ensure all new components are integrated into the `src/App.tsx` or relevant parent components to be visible.
-   **Backend Specifics:**
    -   All async controller functions must be wrapped with `catchErrors`.
    -   All incoming request data must be validated using Zod schemas.
    -   Use the `logger` for all server-side logging.
    -   When interacting with S3 (MinIO), use `s3Client`, `uploadFileToS3`, and `DeleteObjectCommand`.
    -   When updating products, ensure Meilisearch is also updated.