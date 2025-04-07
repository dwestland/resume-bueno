# Stripe Integration Setup

This document outlines the Stripe integration for payment processing in Resume Bueno.

## Overview

Resume Bueno offers three pricing options:

1. **Monthly Subscription ($9.95/month)**

   - 200 credits per month
   - Environment Variable: `STRIPE_PRICE_ID_MONTHLY`

2. **Yearly Purchase ($45/year)**

   - 2400 credits (equivalent to 12 months)
   - Environment Variable: `STRIPE_PRICE_ID_YEAR`

3. **Additional Credits ($9.95)**
   - 200 additional credits
   - Environment Variable: `STRIPE_PRICE_ID_ADDITIONAL_CREDITS`

## Implementation Details

### Architecture

- Uses **Stripe Checkout** for a secure, hosted payment page
- Leverages **Server Actions** for backend processing
- Implements proper database transaction handling
- Direct integration with user credit system

### Key Files

- `src/lib/stripe.ts` - Core Stripe utilities and configuration
- `src/app/checkout/actions.ts` - Server actions for Stripe operations
- `src/app/checkout/page.tsx` - Checkout page (redirects to Stripe)
- `src/app/checkout/success/page.tsx` - Success page after payment

### Database Changes

After each successful purchase, the system updates:

1. **User Table**

   - `stripe_customer_id` - Customer ID from Stripe
   - `subscription_status` - For subscription plans (ACTIVE, CANCELED, etc.)
   - `credit_balance` - Incremented by the purchased credits

2. **Purchase Table**
   - Creates a comprehensive purchase record with all relevant fields
   - Different fields for subscription vs. one-time purchases
   - Tracks payment status from pending to completed

## Environment Setup

1. **Required Environment Variables**:

   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_ID_MONTHLY=price_...
   STRIPE_PRICE_ID_YEAR=price_...
   STRIPE_PRICE_ID_ADDITIONAL_CREDITS=price_...
   NEXT_PUBLIC_APP_URL=http://localhost:3200 (or your deployment URL)
   ```

2. **Stripe Dashboard Setup**:
   - Create products and prices in the Stripe Dashboard
   - Monthly subscription should have recurring billing enabled
   - Year and Additional Credits should be one-time purchases
   - Copy the price IDs to your environment variables

## Testing

Use these test card numbers in Stripe's test mode:

- **Success**: 4242 4242 4242 4242
- **Authentication Required**: 4000 0025 0000 3155
- **Decline**: 4000 0000 0000 0002

For all test cards, use:

- Any future expiration date
- Any 3-digit CVC
- Any postal code

## Future Enhancements

This implementation focuses on core purchasing functionality. Future enhancements will include:

1. Webhook integration for asynchronous payment events
2. Subscription management (cancellation, updates)
3. Invoice/receipt generation
4. Proration handling for plan changes

## API Version

This integration uses Stripe API version `2025-01-27.acacia`.
