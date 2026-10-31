# Known Limitations and Verification Status

This document prevents the MVP from being described as more complete than it is.

## Known from the inspected application

- The project uses Next.js App Router and TypeScript.
- Supabase browser and server client helper files exist.
- Login, signup, and logout Server Actions exist.
- An email callback route exists and exchanges an authorization code for a session.
- A Next.js 16 proxy and Supabase session-refresh helper were added.
- The dashboard route verifies Supabase claims before rendering the client dashboard.
- A dashboard client component and dashboard stylesheet exist.
- The dashboard component uses browser `localStorage` under a versioned storage key and includes demo subscription records.
- The dashboard client component expects an `email` prop from the server page.

## Not established as complete

- Persistent subscription storage in Supabase PostgreSQL.
- Cross-device synchronization.
- Organization workspace and membership management.
- Production-grade B2B entitlement authorization.
- Payment processor integration or automatic cancellation.
- Real usage integrations for external subscription services.
- Reliable notification delivery for renewals.
- AI predictions or automated financial advice.
- Full accessibility and responsive visual QA across devices.
- Successful end-to-end signup and confirmation using the production SMTP provider.

## Dashboard UI note

A prior deployment displayed the dashboard text and controls but appeared visually broken. The component existed, but its route initially rendered the old welcome page. The route was subsequently changed to render the client component. A separate check is required to confirm the stylesheet is imported and that the production site serves the latest CSS.

## Verification policy

A feature is complete only when:

1. Its code is present in the repository.
2. Type checking and production build pass.
3. Its runtime behavior is tested.
4. Its data and authorization behavior are tested where applicable.
5. Production deployment is confirmed when the feature is intended for production.

Do not mark a feature as verified merely because a build succeeds.
