# Technical Architecture

## Current application structure

The known application layout is a Next.js App Router project under `web/` with a `src/` directory.

```text
web/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── dashboard-client.tsx
│   │   │   └── dashboard.css
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── proxy.ts
│   └── proxy.ts
├── package.json
└── ...
```

This is based on the project files inspected during the development conversation. Always compare it with the current repository before assuming every path still exists.

## Request and rendering flow

1. A visitor opens a Next.js route.
2. The root `src/proxy.ts` delegates to the Supabase session-refresh helper.
3. The helper creates a request-scoped Supabase server client and refreshes/propagates cookies using `getClaims()`.
4. The `/login` page renders login and signup forms.
5. Server Actions call Supabase Auth.
6. The `/auth/callback` Route Handler exchanges the PKCE authorization code for a session.
7. The `/dashboard` Server Component verifies claims before rendering the client dashboard.

## Dashboard component boundary

`src/app/dashboard/page.tsx` should remain a Server Component responsible for verifying the current identity. It should pass only required, non-secret display information (for example, the user's email) to `dashboard-client.tsx`.

`dashboard-client.tsx` is a Client Component responsible for interactive UI state. It should not contain secret keys or privileged authorization logic.

`dashboard.css` provides dashboard-specific presentation. It must be imported from the appropriate component or layout so the styles are loaded. Global styles in `globals.css` should not unintentionally override dashboard layout classes.

## Supabase client separation

- Browser client: `createBrowserClient` from `@supabase/ssr` for browser-side features.
- Server client: `createServerClient` from `@supabase/ssr` with Next.js cookies for Server Components, Server Actions, and Route Handlers.
- Proxy helper: a fresh server client per request, cookie reads/writes, and session refresh with `getClaims()`.

Do not reuse a request-specific Supabase client in module-global state.

## Data flow target

The intended persistent architecture is:

```text
Next.js UI
   |
   v
Server Actions / Route Handlers
   |
   v
Supabase Auth (verified user identity)
   |
   v
PostgreSQL + Row Level Security
   |
   v
User-owned subscriptions / organization plans / entitlements
```

The current browser-local MVP should be considered a prototype data store, not cloud persistence. A later database integration should migrate the UI from local storage to authenticated queries and mutations.
