#!/usr/bin/env node

/**
 * This script tests the Stripe webhook endpoint by simulating a checkout session completed event
 * Run with: node scripts/test-stripe-webhook.js
 */

import crypto from 'crypto'
import http from 'http'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Configure these values
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
const ENDPOINT = '/api/webhook/stripe'
const HOST = 'localhost'
const PORT = 3200
const USER_ID = 'test-user-id' // Replace with an actual user ID from your database
const CUSTOMER_ID = 'cus_test123' // Replace with an actual Stripe customer ID
const SESSION_ID = 'cs_test_' + Math.random().toString(36).substring(2, 15)

// Create a sample checkout.session.completed event
const createEvent = () => {
  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 15),
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: SESSION_ID,
        object: 'checkout.session',
        customer: CUSTOMER_ID,
        client_reference_id: USER_ID,
        metadata: {
          userId: USER_ID,
          productType: 'monthly', // Change to 'yearly' or 'additional_credits' as needed
        },
        mode: 'subscription', // Change to 'payment' for yearly or additional credits
        payment_status: 'paid',
        status: 'complete',
        subscription: 'sub_' + Math.random().toString(36).substring(2, 15),
      },
    },
    type: 'checkout.session.completed',
  }
}

// Sign the payload with the webhook secret
const signPayload = (payload, secret) => {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const signature = hmac.digest('hex')
  const timestamp = Math.floor(Date.now() / 1000)
  return `t=${timestamp},v1=${signature}`
}

// Send the webhook event
const sendWebhook = () => {
  const event = createEvent()
  const payload = JSON.stringify(event)
  const signature = signPayload(payload, WEBHOOK_SECRET)

  const options = {
    hostname: HOST,
    port: PORT,
    path: ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Stripe-Signature': signature,
    },
  }

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`)

    let responseData = ''
    res.on('data', (chunk) => {
      responseData += chunk
    })

    res.on('end', () => {
      console.log('Response:', responseData)
      console.log('\nWebhook event sent successfully!')
      console.log('Event Type:', event.type)
      console.log('Session ID:', event.data.object.id)
      console.log('User ID:', event.data.object.client_reference_id)
      console.log('Product Type:', event.data.object.metadata.productType)
    })
  })

  req.on('error', (error) => {
    console.error('Error sending webhook:', error.message)
  })

  req.write(payload)
  req.end()

  console.log('Sending webhook event to', `http://${HOST}:${PORT}${ENDPOINT}`)
  console.log('Type:', event.type)
}

// Execute the webhook test
sendWebhook()
