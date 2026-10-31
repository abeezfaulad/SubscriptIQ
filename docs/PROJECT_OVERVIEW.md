# SubscriptIQ — Project Overview

## Vision

Make subscription management more understandable and actionable. SubscriptIQ combines personal subscription visibility with a foundation for businesses that sell software through subscription plans.

## Problem

Individuals can lose track of recurring payments, forget to review services they no longer use, pay for services with overlapping functions, and miss upcoming renewals. Businesses have a separate problem: they need consistent rules for mapping a customer's plan and subscription state to product features and usage limits.

## Solution

SubscriptIQ has two product contexts:

### Personal workspace (B2C)

A personal workspace helps an individual:

1. Record subscriptions and their recurring prices.
2. See monthly-equivalent and yearly-estimated spending.
3. Review services that may be unused.
4. Compare services in similar categories.
5. model possible savings.
6. see upcoming renewal dates.

### Business workspace (B2B direction)

A business workspace is intended to help a SaaS provider:

1. Define subscription plans.
2. Define features and usage limits.
3. Assign plan entitlements to customers.
4. Handle trial, active, past-due, and cancelled states.
5. Resolve the permissions a customer should receive.

The personal and business workspaces are related product areas, but they must have distinct data ownership and access control.

## Product principles

- **Clarity:** show recurring costs and upcoming commitments in one place.
- **Useful signals, not assumptions:** inactivity and overlap should prompt user review, never automatically cancel a service.
- **Privacy:** collect only the information needed to provide the service.
- **Security:** authenticate users and enforce ownership at the database layer.
- **Honest automation:** distinguish deterministic calculations from AI predictions and from actions that require a user decision.

## Current stage

The current state is an MVP with a dashboard UI, sample subscriptions, browser-local storage, deterministic spending calculations, and an entitlement-plan preview. Supabase Auth integration exists in the application code, but it must be tested end-to-end. Persistent subscription storage, organization membership, real payment processing, and production entitlement enforcement are not complete unless separately implemented and verified.
