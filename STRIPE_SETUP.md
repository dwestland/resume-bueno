# Stripe Integration Documentation

This document explains the Stripe integration for the Resume Bueno SaaS application.

## Overview

Resume Bueno uses Stripe for payment processing with two plans:

1. **Monthly Plan**: $9.95/month recurring subscription for 200 credits topped off monthly
2. **Yearly Plan**: $45 one-time payment for a year of service with 200 credits topped off monthly (65% savings)

## Architecture

The integration uses a modern server-side approach with Next.js 15 and Stripe Elements:

- **Server Actions**: All Stripe operations use Next.js server actions rather than API routes
- **Webhooks**: Stripe webhooks handle asynchronous events like payments and subscription updates
- **Prisma**: Database operations are managed through Prisma ORM

## Database Schema

The following models support the payment functionality:

### User Model

- `subscription_plan`: Enum (MONTHLY, YEARLY, NONE)
- `subscription_status`: Enum (ACTIVE, INACTIVE, CANCELED, PAST_DUE)
- `subscription_start`: DateTime
- `subscription_end`: DateTime
- `subscription_id`: String (Stripe subscription ID for monthly plans, or a "one-time-{session_id}" for yearly plans)
- `stripe_customer_id`: String (Stripe customer ID)
- `credits`: Int

### Purchase Model

- Records all purchase transactions
- Tracks purchase type, amount, and status
- Links to the user who made the purchase

## Implementation Components

### 1. Stripe Utilities (`src/lib/stripe.ts`)

- Initializes the Stripe client
- Provides functions for common operations (create checkout, verify webhooks)
- Handles customer creation and management

### 2. Server Actions (`src/lib/actions/subscription.ts`)

- `createSubscriptionCheckout`: Creates a checkout session for monthly subscription or yearly one-time payment
- `recordSubscriptionPurchase`: Records a successful purchase in the database
- `cancelUserSubscription`: Cancels a user's subscription
- `checkSubscriptionStatus`: Checks a user's subscription status
- `replenishCredits`: Manually tops up credits
- `getUserPurchaseHistory`: Retrieves purchase history
- `getUserCredits`: Gets current user credit balance

### 3. Webhook Handler (`src/app/api/webhook/stripe/route.ts`)

Handles the following events:

- `checkout.session.completed`: When a checkout is completed
  - Handles both subscription (monthly) and one-time payment (yearly) modes
- `customer.subscription.updated`: When a subscription is updated (monthly plans only)
- `customer.subscription.deleted`: When a subscription is canceled (monthly plans only)
- `invoice.payment_failed`: When payment fails (monthly plans only)

### 4. UI Components

- `src/app/checkout-page/page.tsx`: Checkout page that redirects to Stripe
- `src/app/checkout-success/page.tsx`: Success page after successful checkout
- `src/components/PricingSection.tsx`: Pricing display and plan selection

## Credit Management

Credits are managed as follows:

- New users receive 20 free credits upon signup
- Subscribers receive 200 credits on subscription start
- Monthly subscribers: Credits are topped up to 200 at the beginning of each billing period
- Yearly subscribers: Credits are topped up to 200 at the beginning of each month
- Credit usage is tracked in the database

## Testing

Testing the Stripe integration:

1. Use Stripe test mode credentials (already configured in env vars)
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Test webhook events using the Stripe CLI

## Webhook Setup

For local development, use the Stripe CLI to forward webhook events:

```
stripe listen --forward-to localhost:3200/api/webhook/stripe
```

For production, configure the webhook endpoint in the Stripe dashboard:
`https://your-domain.com/api/webhook/stripe`

## Environment Variables

The following environment variables are required:

```
# Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe prices
STRIPE_PRICE_ID_MONTHLY=price_... # Monthly subscription price ID
STRIPE_PRICE_ID_YEAR=price_...    # Yearly one-time payment price ID
```

## Going to Production

When moving to production:

1. Update the environment variables with production Stripe keys
2. Configure the production webhook endpoint
3. Update the price IDs for the production plans
4. Test the entire flow with a real payment
