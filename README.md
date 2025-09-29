# TK Kozijnen Factory Suite

Web application scaffold for managing uPVC (plastic) window frame production. The stack combines Next.js 15 (App Router) with TypeScript, TailwindCSS, Prisma, and PostgreSQL to support cleanly separated presentation, domain, and data layers.

## Features in this scaffold

- **Dashboard shell** with navigation between customers, projects, inventory, sales, and drawings modules.
- **Live CRUD flows** for customers, projects, inventory items, invoices, and window frames backed by Next.js API routes.
- **API routes** (`/api/*`) implemented with Prisma services for Customers, Projects, Inventory Items, Window Frames, and Invoices.
- **Domain schemas** powered by Zod for input validation and shared typing between frontend and backend.
- **Prisma schema + seed** covering customers, projects, frames, invoices, and stock, including executable migration SQL.
- **Placeholder drawing canvas** styled with TailwindCSS 4, now coupled with a frame manager to persist layout metadata.

## Project structure

```
src/
  app/                 # Next.js app router pages
    (dashboard)/       # Dashboard layout and feature pages
    api/               # REST endpoints (Next.js route handlers)
  modules/             # Domain schemas, i18n, and utilities
  server/
    db/                # Prisma client helper
    http/              # Shared HTTP response helpers
    modules/           # Feature-specific service layer
prisma/
  migrations/          # SQL migrations (seeded with 0001_init)
  schema.prisma        # Database schema definition
  seed.ts              # Initial data loader (customers, projects, stock)
```

## Environment setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the sample environment variables and adjust if needed:
   ```bash
   cp .env.example .env
   ```
3. Ensure PostgreSQL is running and reachable at the host defined in `DATABASE_URL` (local installation or external server).
4. Apply the Prisma migration and generate the client:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
5. Seed the database with starter data:
   ```bash
   npm run db:seed
   ```
6. Launch the development server:
   ```bash
   npm run dev
   ```

> The default connection string (see `.env.example`) targets a local database named `kozijnen_fabriek` with user/password `postgres/postgres`.

### Useful scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run prisma:migrate`| Apply migrations in development               |
| `npm run prisma:generate` | Generate the Prisma client                 |
| `npm run db:seed`       | Populate the database with demo data          |
| `npm run db:push`       | Sync Prisma schema to the database (no migration history) |
| `npm run prisma:studio` | Open Prisma Studio                            |

## API endpoints

| Method | Endpoint                       | Description                                    |
| ------ | ------------------------------ | ---------------------------------------------- |
| GET    | `/api/customers`               | List customers                                 |
| POST   | `/api/customers`               | Create customer                                |
| GET    | `/api/customers/:id`           | Retrieve customer details                      |
| PUT    | `/api/customers/:id`           | Update customer                                |
| DELETE | `/api/customers/:id`           | Remove customer                                |
| GET    | `/api/projects`                | List projects (with customer & frames)         |
| POST   | `/api/projects`                | Create project                                 |
| GET    | `/api/projects/:id`            | Retrieve project                               |
| PUT    | `/api/projects/:id`            | Update project                                 |
| DELETE | `/api/projects/:id`            | Remove project                                 |
| GET    | `/api/inventory`               | List inventory items                           |
| POST   | `/api/inventory`               | Create inventory item                          |
| GET    | `/api/inventory/:id`           | Retrieve inventory item                        |
| PUT    | `/api/inventory/:id`           | Update inventory item                          |
| DELETE | `/api/inventory/:id`           | Remove inventory item                          |
| GET    | `/api/window-frames`           | List window frames (optional `projectId` filter) |
| POST   | `/api/window-frames`           | Create window frame                            |
| GET    | `/api/window-frames/:id`       | Retrieve window frame                          |
| PUT    | `/api/window-frames/:id`       | Update window frame                            |
| DELETE | `/api/window-frames/:id`       | Remove window frame                            |
| GET    | `/api/invoices`                | List quotes & invoices                         |
| POST   | `/api/invoices`                | Create invoice / quote                         |
| GET    | `/api/invoices/:id`            | Retrieve invoice                               |
| PUT    | `/api/invoices/:id`            | Update invoice                                 |
| DELETE | `/api/invoices/:id`            | Remove invoice                                 |

## Next steps

- Add pagination and search to list views (customers, projects, inventory, invoices).
- Extend window-frame drawing to persist geometry and materials from the interactive canvas.
- Implement authentication/authorisation and audit logging.
- Automate pricing to assemble invoice line items from linked frames and materials.
- Wire background jobs for low-stock alerts and production status notifications.
