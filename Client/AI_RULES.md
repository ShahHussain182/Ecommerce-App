# Frontend Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

# Backend Tech Stack

- You are building a Node.js/Express.js application.
- Use JavaScript with ES Modules (`"type": "module"`).
- Use MongoDB as the database with Mongoose for object data modeling (ODM).
- API routes are versioned under `/api/v1/`.

## Key Libraries & Patterns

- **Authentication:** Session-based authentication managed by `express-session` with a `connect-mongo` store. Access and Refresh tokens (JWTs) are used and stored in secure, `httpOnly` cookies.
- **Validation:** Use `zod` for all incoming request body and parameter validation. Zod schemas are located in `Backend/backend/Schemas/`.
- **Error Handling:** Utilize the centralized `errorHandler` middleware. Use the `catchErrors` utility to wrap async controller functions to ensure errors are passed to the central handler.
- **Logging:** Use the pre-configured `winston` logger for all server-side logging. It provides structured, leveled logging to both the console and daily rotated files.
- **Database Models:** Mongoose models are located in `Backend/backend/Models/`. Always use model methods for operations like password comparison (`user.comparePassword()`).
- **Controllers & Routers:** Keep business logic inside `Controllers` and route definitions inside `Routers`.

## Directory Structure

- `Backend/backend/Controllers/`: Contains the business logic for each route.
- `Backend/backend/Models/`: Mongoose schemas for database collections.
- `Backend/backend/Routers/`: Express.js router definitions.
- `Backend/backend/Schemas/`: Zod validation schemas.
- `Backend/backend/Utils/`: Shared utilities (e.g., token generation, error catching).
- `Backend/backend/Middleware/`: Custom Express middleware.