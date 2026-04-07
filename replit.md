# AcctMarket - Social Media Account Selling Platform

## Overview

A full-stack social media account marketplace where users purchase Instagram, Facebook, Gmail, Twitter/X, TikTok, and Snapchat account credentials using their wallet balance. Includes a complete admin panel for managing users, products, orders, and site settings.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `acctmarket`) at `/`
- **API framework**: Express 5 (artifact: `api-server`) at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT tokens stored in localStorage (in-memory token store on server)
- **Payments**: Paystack (Naira support)

## Key Features

### User Side
- Registration/login with JWT auth
- Product storefront with categories and filters
- Instant log delivery after purchase (deducted from balance)
- Wallet system with Paystack deposit integration
- Order history with log viewing
- Support ticket system
- Profile management

### Admin Panel (`/admin`)
- Dashboard with stats and charts
- User management (ban, adjust balance, make admin)
- Category management
- Product management (add/edit with stock logs)
- Order management
- Deposit management (approve manual deposits)
- Support ticket management
- Site settings (Paystack keys, SEO, content)
- Sales reports with Recharts

## Default Accounts
- Admin: `admin@acctmarket.com` / `admin123`
- Test User: `test@acctmarket.com` / `user123` (balance: ₦1,500)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

Tables: `users`, `categories`, `products`, `orders`, `transactions`, `deposits`, `tickets`, `ticket_messages`, `settings`

## Paystack Integration
Configure Paystack keys in Admin → Settings. Deposits are verified via Paystack API. After payment, user is redirected back with `?reference=` query param for verification.

## API Routes
All routes are under `/api`. See `lib/api-spec/openapi.yaml` for full spec.
Authentication: Bearer token in Authorization header.

## File Structure

```
artifacts/
  acctmarket/       - React frontend
  api-server/       - Express backend
    src/routes/     - auth, users, categories, products, orders, wallet, deposits, support, settings, admin
    src/middlewares/ - auth middleware
    src/lib/        - auth utils, token store
lib/
  db/src/schema/    - users, categories, products, orders, transactions, deposits, tickets, settings
  api-spec/         - OpenAPI spec
  api-client-react/ - Generated React Query hooks
  api-zod/          - Generated Zod schemas
```
