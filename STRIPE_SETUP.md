# Stripe Integration Documentation

This document explains the Stripe integration for the Resume Bueno SaaS application.

## Overview

Resume Bueno uses Stripe for payment processing with three product offerings:

1. **Monthly Plan**: $19.90/month recurring subscription for 200 credits topped off monthly
2. **Yearly Plan**: $199.00 one-time payment for a year of service with 200 credits topped off monthly (17% savings)
3. **Additional Credits**: $9.90 one-time payment for 200 additional credits (available only to active subscribers)

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
- `credits_added`: Int (tracks how many credits were added for credit purchases)

## Implementation Components

### 1. Stripe Utilities (`src/lib/stripe.ts`)

- Initializes the Stripe client
- Provides functions for common operations (create checkout, verify webhooks)
- Handles customer creation and management

### 2. Server Actions (`src/lib/actions/subscription.ts`)

- `createSubscriptionCheckout`: Creates a checkout session for monthly subscription or yearly one-time payment
- `createAdditionalCreditsCheckout`: Creates a checkout session for additional credits purchase
- `recordSubscriptionPurchase`: Records a successful purchase in the database
- `cancelUserSubscription`: Cancels a user's subscription
- `checkSubscriptionStatus`: Checks a user's subscription status
- `replenishCredits`: Manually tops up credits
- `getUserPurchaseHistory`: Retrieves purchase history
- `getUserCredits`: Gets current user credit balance

### 3. Webhook Handler (`src/app/api/webhook/stripe/route.ts`)

Handles the following events:

- `checkout.session.completed`: When a checkout is completed
  - Handles subscription (monthly), one-time payment (yearly), and additional credits purchases
  - Uses `recordSubscriptionPurchase` for both monthly and yearly plans to ensure consistent handling
- `customer.subscription.updated`: When a subscription is updated (monthly plans only)
- `customer.subscription.deleted`: When a subscription is canceled (monthly plans only)
- `invoice.payment_failed`: When payment fails (monthly plans only)

### 4. UI Components

- `src/app/checkout-page/page.tsx`: Checkout page that redirects to Stripe
- `src/app/checkout-success/page.tsx`: Success page after successful checkout
- `src/components/PricingSection.tsx`: Pricing display and plan selection
- `src/components/SubscriptionManagement.tsx`: Manages subscription status and cancellation

## Credit Management

Credits are managed as follows:

- New users receive 20 free credits upon signup
- Subscribers receive 200 credits on subscription start
- Monthly subscribers: Credits are topped up to 200 at the beginning of each billing period
- Yearly subscribers: Credits are topped up to 200 at the beginning of each month
- Additional credits purchase: 200 credits added to the current balance
- Credit usage is tracked in the database

## Testing

Testing the Stripe integration:

1. Use Stripe test mode credentials (already configured in env vars)
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Test webhook events using the Stripe CLI or the test scripts in the `scripts/` directory

### Test Scripts

The `scripts/` directory contains Node.js scripts to test the webhook handler:

- `test-stripe-webhook-yearly.js`: Tests yearly subscription purchase
- `test-stripe-webhook-monthly.js`: Tests monthly subscription purchase
- `test-stripe-webhook-credits.js`: Tests additional credits purchase

To use these scripts:

```
node scripts/test-stripe-webhook-yearly.js
```

See the README in the scripts directory for more details.

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
STRIPE_PRICE_ID_MONTHLY=price_...              # Monthly subscription price ID
STRIPE_PRICE_ID_YEAR=price_...                 # Yearly one-time payment price ID
STRIPE_PRICE_ID_ADDITIONAL_CREDITS=price_...   # Additional credits price ID
```

## Going to Production

When moving to production:

1. Update the environment variables with production Stripe keys
2. Configure the production webhook endpoint
3. Update the price IDs for the production plans
4. Test the entire flow with a real payment
