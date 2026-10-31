# Authentication and Supabase

## Purpose

Supabase Auth provides account creation, email confirmation, password login, logout, and session identity. Next.js server-side rendering uses secure cookie-based session handling through `@supabase/ssr`.

## Known auth files

- `src/lib/supabase/client.ts`: browser client.
- `src/lib/supabase/server.ts`: request-scoped server client using `cookies()`.
- `src/lib/supabase/proxy.ts`: refreshes session cookies and propagates response headers/cookies.
- `src/proxy.ts`: Next.js 16 proxy entry point.
- `src/app/login/actions.ts`: login, signup, and logout Server Actions.
- `src/app/auth/callback/route.ts`: exchanges the email confirmation PKCE code for a session.
- `src/app/dashboard/page.tsx`: verifies claims before rendering protected dashboard content.

## Environment variables

The application has been configured to use these public variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=https://subscriptiq.vercel.app
```

For local development, `NEXT_PUBLIC_SITE_URL` should be `http://localhost:3000`. In Vercel Production, it should be `https://subscriptiq.vercel.app`.

Never put a Supabase secret key or legacy `service_role` key in a `NEXT_PUBLIC_` variable. Never commit `.env.local`.

## URL configuration

In Supabase Dashboard → Authentication → URL Configuration:

- Production Site URL: `https://subscriptiq.vercel.app`
- Production callback allowlist entry: `https://subscriptiq.vercel.app/auth/callback`
- Local callback allowlist entry: `http://localhost:3000/auth/callback`

Add preview callback patterns only if preview deployments are actually used and the pattern is appropriately restricted.

In Vercel → Project → Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to `https://subscriptiq.vercel.app` for Production. Redeploy after changing environment variables.

## Confirmation email template

The Confirm signup template should use Supabase's generated confirmation URL:

```html
<a href="{{ .ConfirmationURL }}">Confirm your SubscriptIQ account</a>
```

Do not hardcode localhost in the template. If building a custom link with `TokenHash`, follow the current Supabase template documentation and ensure the app implements the corresponding route. The inspected application callback is `/auth/callback` and expects a `code` query parameter, so do not substitute a `/auth/confirm` flow without implementing it.

## Recommended manual test plan

1. Register a new test account using an email address you control.
2. Confirm the email using a newly generated message.
3. Verify that the browser returns to `https://subscriptiq.vercel.app/auth/callback` and then `/dashboard`.
4. Refresh `/dashboard`; the session should remain valid.
5. Open `/dashboard` in a signed-out browser; it should redirect to `/login`.
6. Log out; the user should return to `/login` and lose protected access.
7. Attempt an invalid password; the page should show a generic login error without exposing sensitive account details.

## SMTP notes

Custom SMTP is configured in Supabase Dashboard → Authentication → SMTP Settings. SMTP credentials are supplied by the email provider and must never be committed to Git or pasted into chat. The sender address must be authorized by the selected provider. SMTP configuration controls email delivery; it does not itself determine the application's callback route.

## Security rules

- Use `getClaims()` or `getUser()` for server-side identity verification; do not trust a user object from `getSession()` alone for authorization.
- Verify authorization on the server and in database policies, not only by hiding UI.
- Do not use user-editable `user_metadata` as an authorization source.
- Never expose Supabase secret/service-role keys in browser code.
- Use generic auth error messages where revealing whether an email exists could enable account enumeration.
