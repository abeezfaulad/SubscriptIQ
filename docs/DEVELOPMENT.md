# Development and Deployment

## Requirements

- Node.js version supported by the project's Next.js version.
- npm.
- Access to the SubscriptIQ repository.
- Supabase project URL and publishable key for authentication.

## Install and run locally

```bash
cd /home/abeez/Desktop/subscriptiq/web
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build verification

```bash
cd /home/abeez/Desktop/subscriptiq/web
npx next typegen
npx tsc --noEmit
npm run build
git diff --check
```

Resolve errors before committing.

## Git workflow

```bash
git status
git diff --check
git add <specific-files>
git diff --cached --check
git commit -m "feat: describe the change"
git push
```

Review `git status` before staging. Do not stage `.env.local`, `.env`, credentials, build output, or `node_modules`.

## Vercel deployment

The production domain discussed for SubscriptIQ is:

```text
https://subscriptiq.vercel.app
```

When Git integration is configured, pushing to the production branch should trigger a deployment. Verify the deployment status in Vercel rather than assuming the push succeeded in production.

After changing Vercel environment variables, redeploy so the new values are available to the application.

## Environment variable checklist

Local `.env.local` (example names only; use values from your own Supabase project):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vercel Production:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://subscriptiq.vercel.app
```

Do not copy example ellipses into actual configuration. Never put SMTP passwords or Supabase secret/service-role keys in public variables.

## Troubleshooting

### TypeScript passes but production build fails

Read the first TypeScript or prerender error in the build output. Do not suppress type checks to make deployment pass.

### Email confirmation opens localhost

Check `NEXT_PUBLIC_SITE_URL` in Vercel Production, Supabase Site URL, Supabase Additional Redirect URLs, and the Confirm signup email template. Send a new confirmation email after correcting configuration.

### Dashboard shows only the old welcome page

Check that `src/app/dashboard/page.tsx` imports and renders `DashboardClient`, rather than rendering the previous static welcome section.

### Dashboard content is visible but styles are missing

Check that `dashboard-client.tsx` imports `./dashboard.css`, inspect stylesheet loading in browser DevTools, rebuild, deploy, and hard refresh.

### Signup fails after enabling SMTP

Inspect Supabase Auth logs and the SMTP provider's sending logs. Verify SMTP host, port, username, password, and sender domain. Do not expose SMTP credentials in diagnostic output.
