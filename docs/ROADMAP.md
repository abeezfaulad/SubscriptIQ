# SubscriptIQ Roadmap

## Phase 1 — Stable MVP dashboard

- [ ] Confirm dashboard route renders the interactive client component.
- [ ] Confirm dashboard stylesheet is imported and no global CSS conflict breaks it.
- [ ] Verify responsive layout at phone, tablet, laptop, and desktop sizes.
- [ ] Test add, edit, remove, search, and filter subscription flows.
- [ ] Test spend calculations, category breakdown, leak threshold, overlap signals, savings scenarios, and renewal ordering.
- [ ] Clearly label sample/demo records.

## Phase 2 — Reliable authentication

- [ ] Verify custom SMTP sender domain and provider credentials.
- [ ] Verify Confirm signup template uses the correct Supabase confirmation URL.
- [ ] Verify production Site URL and callback allowlist.
- [ ] Test signup, confirmation, login, refresh, logout, and expired/invalid links.
- [ ] Review auth logs and provider delivery logs for failures.

## Phase 3 — Persistent personal data

- [ ] Design and review PostgreSQL schema.
- [ ] Add migrations.
- [ ] Enable RLS on exposed tables.
- [ ] Add ownership policies for each operation.
- [ ] Replace local-only subscription storage with authenticated database queries and mutations.
- [ ] Define a safe migration path for existing browser-local records.
- [ ] Test that users cannot read or change another user's records.

## Phase 4 — Subscription intelligence improvements

- [ ] Make inactivity threshold configurable.
- [ ] Let users confirm or dismiss leak suggestions.
- [ ] Improve overlap categories and allow manual grouping.
- [ ] Add currency and billing-cycle handling.
- [ ] Add timezone-aware renewal presentation.
- [ ] Add notification delivery only after a trusted provider and consent model are configured.

## Phase 5 — B2B Entitlement Engine

- [ ] Add organization workspaces and membership roles.
- [ ] Add plans, features, limits, and entitlement rules.
- [ ] Add customer subscription lifecycle management.
- [ ] Implement a server-side entitlement resolver.
- [ ] Enforce feature access in protected server/API operations.
- [ ] Add audit trails for important plan and access changes.

## Phase 6 — Billing and integrations

- [ ] Select a payment provider and define supported regions/currencies.
- [ ] Implement verified webhook handling and idempotency.
- [ ] Map provider billing states to internal subscription states.
- [ ] Add external-service integrations only where supported by official APIs and user authorization.
- [ ] Add operational monitoring and incident handling.

## Release criteria

A release should not be considered production-ready until build checks pass, core flows have been tested, RLS and authorization have been reviewed, secrets are protected, and the production deployment is verified.
