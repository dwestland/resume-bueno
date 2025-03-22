# Stripe Testing Scripts

This directory contains Node.js scripts to help test the Stripe integration, particularly the webhook handling for different purchase types.

## Available Scripts

- **test-stripe-webhook-yearly.js**: Tests the webhook handler with a simulated yearly subscription purchase event
- **test-stripe-webhook-monthly.js**: Tests the webhook handler with a simulated monthly subscription purchase event
- **test-stripe-webhook-credits.js**: Tests the webhook handler with a simulated additional credits purchase event

## How to Use

1. First, ensure you have your environment variables set up:

   ```
   export STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

2. Start your local server:

   ```
   npm run dev
   ```

3. Run the appropriate test script:

   ```
   node scripts/test-stripe-webhook-yearly.js
   ```

   or

   ```
   node scripts/test-stripe-webhook-monthly.js
   ```

   or

   ```
   node scripts/test-stripe-webhook-credits.js
   ```

4. Check the server logs and database to verify that the webhook was processed correctly.

## Webhook Configuration

For local testing, use Stripe CLI to forward webhook events to your local server:

```
stripe listen --forward-to localhost:3200/api/webhook/stripe
```

For production, configure the webhook endpoint in the Stripe dashboard to point to:
`https://your-domain.com/api/webhook/stripe`

## Notes

- These scripts simulate Stripe webhook events by creating a payload with the structure Stripe would send.
- The scripts sign the payload with a webhook secret to pass the signature verification.
- The `client_reference_id` and `metadata.userId` fields are set to a test user ID that should be updated to match a real user in your database.
