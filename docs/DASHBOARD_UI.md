# Dashboard UI and Navigation

## Route

The authenticated dashboard is served from:

```text
src/app/dashboard/page.tsx
```

The expected page composition is:

- Server page verifies Supabase claims.
- Server page passes the authenticated email into the dashboard client component.
- Client component renders navigation, summaries, charts/insights, forms, tables, and interactive views.
- Dashboard-specific CSS is imported so the layout and visual styles load.

## Navigation model

The planned personal workspace navigation is:

### Workspace
- Overview
- Subscriptions

### Intelligence
- Subscription Guardian
- Savings Simulator
- Renewals

### Business
- Entitlements

### Settings
- Privacy & Data

The sidebar should identify the selected workspace and current account. Navigation controls should remain usable at laptop and mobile widths.

## Overview layout

Recommended hierarchy:

1. Sidebar navigation.
2. Top bar with workspace identity and account menu.
3. Page title and primary Add subscription action.
4. Notice explaining whether data is local-only or cloud-synced.
5. KPI cards: monthly recurring spend, active subscriptions, potential leaks, upcoming renewals.
6. Spend breakdown by category.
7. Upcoming renewals list.
8. Guardian/overlap/savings insight cards.
9. Subscription table.

## Visual quality checklist

- Confirm `dashboard.css` is imported by `dashboard-client.tsx`.
- Check `globals.css` for broad selectors that override component styles.
- Verify the sidebar has a fixed or sticky desktop layout and a usable mobile navigation pattern.
- Check content width, responsive grid breakpoints, table overflow, and card wrapping.
- Use consistent spacing, border colors, typography, icon sizes, and selected-navigation states.
- Avoid relying on special HTML entities for icons; use accessible text or a consistent icon library.
- Ensure buttons have visible hover, focus, disabled, and active states.
- Ensure forms have labels, validation, and keyboard accessibility.
- Test at 360px, 768px, 1024px, and 1440px viewport widths.

## Current data presentation

The earlier dashboard output showed sample services such as Netflix, Spotify, Google One, Microsoft 365, and Prime Video, with INR prices and example renewal dates. These are demo records, not verified real user transactions. Mark demo data clearly and let users replace/remove it.

## Troubleshooting broken styling

If the text content appears but the design looks unstyled:

1. Confirm `dashboard.css` exists at `src/app/dashboard/dashboard.css`.
2. Confirm `dashboard-client.tsx` imports `./dashboard.css` near the top.
3. Inspect the browser console and Network panel for failed stylesheet requests.
4. Inspect computed styles to see whether `globals.css` or Tailwind rules override dashboard styles.
5. Confirm the deployed commit contains the latest CSS and that Vercel completed a new production deployment.
6. Hard refresh the browser after deployment.

A successful TypeScript build does not prove that CSS is visually correct; inspect the page at multiple widths.
