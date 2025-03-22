// Test script for Stripe webhook additional credits purchase
import crypto from 'crypto'
import http from 'http'

// Replace with your webhook secret and endpoint
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
const WEBHOOK_ENDPOINT = 'http://localhost:3200/api/webhook/stripe'

// Create a sample checkout.session.completed event for additional credits
const createAdditionalCreditsEvent = () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const userId = 'test-user-id-' + Date.now().toString().slice(-4)
  const customerId = 'cus_' + crypto.randomBytes(8).toString('hex')

  return {
    id: 'evt_' + crypto.randomBytes(12).toString('hex'),
    object: 'event',
    api_version: '2022-11-15',
    created: timestamp,
    data: {
      object: {
        id: 'cs_' + crypto.randomBytes(12).toString('hex'),
        object: 'checkout.session',
        after_expiration: null,
        allow_promotion_codes: null,
        amount_subtotal: 990,
        amount_total: 990,
        automatic_tax: { enabled: false, status: null },
        billing_address_collection: null,
        cancel_url: 'http://localhost:3200/settings',
        client_reference_id: userId,
        consent: null,
        consent_collection: null,
        created: timestamp - 60,
        currency: 'usd',
        custom_fields: [],
        custom_text: { shipping_address: null, submit: null },
        customer: customerId,
        customer_creation: 'if_required',
        customer_details: {
          address: {
            city: null,
            country: null,
            line1: null,
            line2: null,
            postal_code: null,
            state: null,
          },
          email: 'test@example.com',
          name: 'Test User',
          phone: null,
          tax_exempt: 'none',
          tax_ids: [],
        },
        customer_email: 'test@example.com',
        expires_at: timestamp + 3600,
        livemode: false,
        locale: null,
        metadata: {
          userId: userId,
          productType: 'additionalCredits',
        },
        mode: 'payment',
        payment_intent: 'pi_' + crypto.randomBytes(12).toString('hex'),
        payment_link: null,
        payment_method_collection: 'always',
        payment_method_options: {},
        payment_method_types: ['card'],
        payment_status: 'paid',
        phone_number_collection: { enabled: false },
        recovered_from: null,
        setup_intent: null,
        shipping_address_collection: null,
        shipping_cost: null,
        shipping_details: null,
        shipping_options: [],
        status: 'complete',
        submit_type: null,
        subscription: null,
        success_url: 'http://localhost:3200/settings?success=true',
        total_details: {
          amount_discount: 0,
          amount_shipping: 0,
          amount_tax: 0,
        },
        url: null,
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_' + crypto.randomBytes(12).toString('hex'),
      idempotency_key: null,
    },
    type: 'checkout.session.completed',
  }
}

// Sign the payload with the webhook secret
const signPayload = (payload, secret) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const payloadString = JSON.stringify(payload)
  const signedPayload = `${timestamp}.${payloadString}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')
  return {
    signature: `t=${timestamp},v1=${signature}`,
    payload: payloadString,
  }
}

// Send webhook event to the endpoint
const sendWebhook = (endpoint, signedPayload) => {
  return new Promise((resolve, reject) => {
    const { hostname, pathname, port } = new URL(endpoint)

    const options = {
      hostname: hostname,
      port: port || 80,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signedPayload.payload),
        'Stripe-Signature': signedPayload.signature,
      },
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(signedPayload.payload)
    req.end()
  })
}

// Main function
const main = async () => {
  try {
    const event = createAdditionalCreditsEvent()
    console.log('Generated event:', JSON.stringify(event, null, 2))

    const signedPayload = signPayload(event, WEBHOOK_SECRET)
    console.log('Sending webhook to:', WEBHOOK_ENDPOINT)

    const response = await sendWebhook(WEBHOOK_ENDPOINT, signedPayload)
    console.log('Response:', response)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
