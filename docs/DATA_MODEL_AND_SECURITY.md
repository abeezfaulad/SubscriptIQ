# Data Model and Security

This is a proposed persistent data model for the next backend milestone. It is not a claim that these tables already exist in the connected Supabase database.

## Personal subscription record

A subscription record should contain:

| Field | Suggested type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner, references `auth.users.id` |
| `name` | text | Service name |
| `category` | text | Category label |
| `amount` | numeric | Amount per billing cycle |
| `currency` | text | ISO currency code, e.g. INR |
| `billing_cycle` | text/enum | monthly or yearly |
| `next_renewal_at` | date | Next expected renewal |
| `last_used_at` | date, nullable | Last activity date entered by user |
| `status` | text/enum | active, trial, past_due, cancelled |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

Use numeric types suitable for money and define currency behavior explicitly. Do not store currency as a floating-point value if exact monetary arithmetic is required.

## Business model (proposed)

Potential tables:

- `organizations`: business workspaces.
- `organization_members`: user-to-organization membership and role.
- `plans`: organization-defined subscription plans.
- `features`: feature catalog.
- `plan_entitlements`: plan-to-feature mapping and limits.
- `customer_subscriptions`: customer subscription state and plan assignment.
- `usage_counters`: metered usage where required.

The exact schema should be developed from actual requirements and migrations, not copied blindly.

## Row Level Security principles

For personal subscription records:

- Enable RLS.
- Restrict `SELECT`, `INSERT`, `UPDATE`, and `DELETE` to the authenticated owner.
- For `UPDATE`, enforce ownership in both `USING` and `WITH CHECK` clauses.
- Do not rely only on client-side filters such as `.eq('user_id', user.id)`; database policies must enforce ownership.

For organization records:

- Verify organization membership and role in policies or trusted server-side authorization.
- Do not assume that any authenticated user can access every organization.
- Do not use client-editable user metadata to grant organization roles or paid entitlements.

## Example ownership policy pattern

The following is an illustrative policy for a table with a `user_id` column. Check the actual table name, privileges, and existing policies before applying it:

```sql
alter table public.subscriptions enable row level security;

create policy "Users can read their subscriptions"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their subscriptions"
on public.subscriptions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their subscriptions"
on public.subscriptions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their subscriptions"
on public.subscriptions
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

Do not execute this example until the table schema and current policies have been inspected. Avoid duplicate policy names and overly broad grants.

## Secrets and keys

- Browser: Supabase publishable key only.
- Server: use user-scoped server client for normal user operations.
- Never expose `service_role` or Supabase secret keys to the browser.
- SMTP credentials remain in Supabase's SMTP settings, not application source code.
- Do not log passwords, OTP values, access tokens, refresh tokens, confirmation URLs, or API keys.
