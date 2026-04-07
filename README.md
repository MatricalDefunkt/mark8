# Mark8 Monorepo

Prototype monorepo for a multi-tenant SaaS that sells pre-made n8n workflows with role-based access, plan quotas, token billing, and support ticketing.

## Workspace layout

- `apps/web`: Next.js application (dashboard + API)
- `apps/worker`: Background worker for workflow execution orchestration
- `packages/contracts`: Shared Zod schemas and inferred TypeScript types
- `packages/authz`: RBAC policies and permission helpers
- `packages/db`: Prisma schema, client, and seed scripts
- `packages/config`: Environment parsing and shared runtime config

## Quick start

1. Install dependencies with Bun.
2. Copy `.env.example` to `.env` and fill required values.
3. Start dev mode with `bun run dev`.

## POC / MVP dashboard flow

1. Ensure Postgres and Redis are running (the provided `docker-compose.yml` can be used).
2. Run Prisma generate/migrate/seed from the workspace scripts.
3. Open the web app and use the role-targeted links on the home page:
   - Admin (`/dashboard/admin?role=admin`)
   - Billing (`/dashboard/billing?role=billing`)
   - Sales (`/dashboard/sales?role=sales`)
   - Client (`/dashboard/client?role=client`)

### Data mode behavior

- If the database is reachable and seeded, dashboards render live organization metrics.
- If the database is unavailable, dashboards automatically switch to safe fallback demo data for presentation continuity.

### API endpoint

- `GET /api/dashboard/overview?role=admin` returns the dashboard snapshot JSON used by the pages.

## Stripe webhook setup (local)

1. Ensure your `.env` has:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - If the web app cannot see these values, place the same keys in `apps/web/.env.local` (Next.js reads env from the app directory).
2. Start the app (`bun run dev`) so `http://localhost:3000` is running.
3. In another terminal, log in and forward Stripe events to this route:
   - `stripe login`
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the signing secret printed by Stripe CLI (starts with `whsec_`) into `STRIPE_WEBHOOK_SECRET` in `.env`.
5. Trigger a test event:
   - `stripe trigger checkout.session.completed`

You should see successful webhook responses and event logs from `/api/stripe/webhook`.
