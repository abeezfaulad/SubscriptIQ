# Features and Expected Behavior

This document defines expected product behavior. It does not claim that every feature is already connected to a production backend.

## 1. Overview dashboard

The overview should summarize:

- Monthly recurring spend.
- Estimated annual spend.
- Number of active subscriptions.
- Number of trial subscriptions.
- Number of potential spending leaks.
- Number of renewals in the next 30 days.
- Spending by category.
- Upcoming renewals.
- A compact list of tracked subscriptions.

### Calculation rules

For a monthly subscription, monthly equivalent = monthly price.

For a yearly subscription, monthly equivalent = yearly price / 12.

Estimated annual spend = monthly-equivalent total * 12. This is an estimate and does not represent an exact invoice schedule.

Only subscriptions in relevant billable states should contribute to recurring spend. Cancelled subscriptions should not be counted as currently recurring. The product should document how trials and past-due records are treated.

## 2. Subscription manager

Each subscription should support, at minimum:

- Service name
- Category
- Amount
- Billing cycle (monthly or yearly)
- Next renewal date
- Last-used date
- Status (active, trial, past due, cancelled)

Users should be able to add, edit, search, filter, and remove records. Form validation should reject empty names, invalid amounts, invalid dates, and unsupported billing cycles.

## 3. Subscription Guardian

### Leak Finder

Flags subscriptions whose last-used date is older than a configurable threshold (the current concept uses 60 days). The user decides what action to take. The app must not infer actual usage from a service provider unless a verified integration exists.

### Overlap Detector

Groups services by category or a manually maintained similarity mapping. A shared category is only a possible overlap. It does not prove that two services provide identical features.

## 4. Savings Simulator

Allows the user to select subscriptions for a hypothetical cancellation scenario and calculates the estimated monthly and annual savings. It must not cancel subscriptions or contact providers.

For selected monthly items, monthly savings equal their monthly price. For selected yearly items, monthly-equivalent savings equal yearly price / 12. Annual savings equal the monthly-equivalent total * 12.

## 5. Renewal Center

Shows upcoming renewal dates, days remaining, billing frequency, and expected charge. Dates should be handled consistently using the user's intended timezone. The app should not claim to send reminders unless a notification-delivery service has actually been configured.

## 6. Entitlement Engine (business direction)

A business defines plans, features, limits, and customer subscription states. A resolver determines whether a customer can use a feature and whether a usage limit has been reached.

Example conceptual plans:

| Feature | Free | Pro | Enterprise |
|---|---:|---:|---:|
| Basic dashboard | Yes | Yes | Yes |
| Advanced analytics | No | Yes | Yes |
| Team management | No | No | Yes |
| API access | No | Limited | Full |

This table is illustrative. Actual product plans must be configured by each organization. The frontend preview alone is not a secure entitlement system; enforcement must happen server-side or through protected database/API operations.

## 7. Privacy and data controls

Users should be able to understand what is stored, export their records, and request deletion where supported. Data export and deletion must operate on the correct user's records and must be verified in the backend before being described as complete.
