# SubscriptIQ

**Subscription intelligence and management for individuals and businesses.**

SubscriptIQ helps people understand recurring subscriptions, identify potentially wasted spending, compare overlapping services, plan renewals, and estimate savings. Its business-facing direction adds subscription plans and feature entitlements for SaaS providers.

> **Project status:** The current dashboard is an MVP frontend. Subscription records and dashboard interactions currently use browser-local storage. Supabase authentication is being integrated, but subscription cloud persistence, organization workspaces, billing integrations, and production entitlement enforcement must be implemented and verified separately.

## Product areas

- **Overview:** recurring spend, yearly estimate, active subscriptions, potential spending leaks, category breakdown, and upcoming renewals.
- **Subscriptions:** add, inspect, search, filter, update usage information, and remove tracked services.
- **Subscription Guardian:** highlights potentially unused subscriptions and categories with overlapping services.
- **Savings Simulator:** models hypothetical savings when a user considers removing a subscription.
- **Renewal Center:** shows upcoming renewal dates and estimated costs.
- **Entitlements:** previews how plan tiers can map to product features and limits.
- **Privacy & Data:** explains local data handling and provides data export controls where implemented.

## Technology direction

- Next.js App Router
- React and TypeScript
- Tailwind CSS and project-specific CSS
- Supabase Auth using `@supabase/ssr` and `@supabase/supabase-js`
- Supabase PostgreSQL and Row Level Security (planned for persistent subscription data)
- Vercel deployment

## Local development

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000>.

## Verification

Run these before committing:

```bash
cd web
npx next typegen
npx tsc --noEmit
npm run build
git diff --check
```

## Documentation

- [Product overview](docs/PROJECT_OVERVIEW.md)
- [Features and behavior](docs/FEATURES.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Authentication and Supabase](docs/AUTHENTICATION.md)
- [Dashboard UI and navigation](docs/DASHBOARD_UI.md)
- [Development and deployment](docs/DEVELOPMENT.md)
- [Data model and security](docs/DATA_MODEL_AND_SECURITY.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Roadmap](docs/ROADMAP.md)

## Important terminology

- **Subscription:** a service a person or organization pays for on a recurring basis.
- **Renewal:** the next expected billing date.
- **Potential leak:** a subscription that appears unused based on its last-used date; this is an alert for review, not proof that the subscription should be cancelled.
- **Overlap:** two or more services in the same or similar categories; this is a comparison signal, not proof that one is redundant.
- **Entitlement:** permission to use a feature, usually determined by an active plan, limits, and subscription state.

## Security note

Never commit `.env`, `.env.local`, API keys, SMTP passwords, Supabase secret/service-role keys, access tokens, or user credentials. Browser-exposed Supabase keys must be publishable keys, and database access must be restricted with correctly designed Row Level Security policies.
