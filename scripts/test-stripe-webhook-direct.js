// Script to test the webhook handler with a direct user ID
import crypto from 'crypto'
import http from 'http'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')

  // Simple env parser
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^['"]|['"]$/g, '') // Remove quotes
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })

  console.log('Loaded environment variables from .env.local')
} catch (err) {
  console.warn('Failed to load .env.local file:', err.message)
}

// Replace with your webhook secret and endpoint
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
const WEBHOOK_ENDPOINT = 'http://localhost:3200/api/webhook/stripe'

// Use a real user ID from your database
const REAL_USER_ID = 'cm70omxw10000la039k4plf8h' // Replace with your actual user ID

console.log(
  'Using webhook secret:',
  WEBHOOK_SECRET ? 'Secret is set' : 'No secret found'
)
console.log('Using real user ID:', REAL_USER_ID)

// Create a sample event
async function main() {
  try {
    // First, get the current user details to use the correct subscription ID
    console.log(`Fetching user details for ID: ${REAL_USER_ID}`)
    const userResponse = await fetch(
      `http://localhost:3200/api/test-stripe/check?userId=${REAL_USER_ID}`
    )
    const userData = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error(
        `Failed to fetch user details: ${JSON.stringify(userData)}`
      )
    }

    console.log(`User details:`, userData)

    // Create a session ID for this test
    const sessionId = `cs_test_${Date.now()}`

    // Create a purchase record first via the direct purchase endpoint
    console.log(`Creating purchase record via direct purchase endpoint`)
    const purchaseResponse = await fetch(
      `http://localhost:3200/api/test-stripe/direct-purchase?userId=${REAL_USER_ID}`
    )
    const purchaseData = await purchaseResponse.json()

    if (!purchaseResponse.ok) {
      throw new Error(
        `Failed to create purchase record: ${JSON.stringify(purchaseData)}`
      )
    }

    console.log(`Purchase record created:`, purchaseData)

    // Use the actual subscription ID from the purchase response
    const subscriptionId = purchaseData.user.subscription_id
    console.log(`Using subscription ID: ${subscriptionId}`)

    // Use the actual customer ID from the purchase response
    const customerId = purchaseData.user.stripe_customer_id
    console.log(`Using customer ID: ${customerId}`)

    const event = {
      id: `evt_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          object: 'checkout.session',
          customer: customerId,
          subscription: subscriptionId,
          client_reference_id: REAL_USER_ID,
          metadata: {
            userId: REAL_USER_ID,
            productType: 'monthly',
          },
          mode: 'subscription',
        },
      },
    }

    console.log(`Generated event with real user ID: ${REAL_USER_ID}`)

    // Sign the payload
    const signedPayload = signPayload(event, WEBHOOK_SECRET)
    console.log('Sending webhook to:', WEBHOOK_ENDPOINT)

    // Send the webhook
    const response = await sendWebhook(WEBHOOK_ENDPOINT, signedPayload)

    console.log('Response status:', response.statusCode)
    console.log('Response body:', response.body)

    // Check user after webhook call
    console.log('\nYou can check the user status with:')
    console.log(
      `curl "http://localhost:3200/api/test-stripe/check?userId=${REAL_USER_ID}"`
    )
  } catch (error) {
    console.error('Error in main function:', error)
  }
}

// Create a more accurate signed payload for Stripe webhooks
const signPayload = (payload, secret) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const payloadString = JSON.stringify(payload)
  const signedPayload = `${timestamp}.${payloadString}`

  // Create the signature using SHA256 HMAC
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  console.log('Timestamp:', timestamp)
  console.log('Signature generated:', signature.substring(0, 10) + '...')

  // Format exactly as Stripe expects
  return {
    signature: `t=${timestamp},v1=${signature}`,
    payload: payloadString,
  }
}

// Send webhook event to the endpoint with improved error handling
const sendWebhook = (endpoint, signedPayload) => {
  return new Promise((resolve, reject) => {
    try {
      const { hostname, pathname, port } = new URL(endpoint)

      const options = {
        hostname,
        port: port || 80,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(signedPayload.payload),
          'Stripe-Signature': signedPayload.signature,
        },
      }

      console.log('Request options:', {
        url: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(signedPayload.payload),
          'Stripe-Signature': signedPayload.signature.substring(0, 20) + '...',
        },
      })

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
        console.error('Request error:', error.message)
        reject(error)
      })

      req.write(signedPayload.payload)
      req.end()
    } catch (error) {
      console.error('Error in sendWebhook:', error.message)
      reject(error)
    }
  })
}

main()
