'use server'

import { Resend } from 'resend'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class MessageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MessageError'
  }
}

export async function sendMessage(formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const message = formData.get('message')

  // Validate form data
  if (!name || typeof name !== 'string' || name.length < 2) {
    throw new MessageError('Invalid name provided')
  }

  if (
    !email ||
    typeof email !== 'string' ||
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
  ) {
    throw new MessageError('Invalid email provided')
  }

  if (
    !message ||
    typeof message !== 'string' ||
    message.length < 10 ||
    message.length > 1000
  ) {
    throw new MessageError('Invalid message provided')
  }

  const resend = new Resend(process.env.AUTH_RESEND_KEY)

  try {
    // Insert the submitted message into the Message table
    await prisma.message.create({
      data: { name, email, message },
    })

    // Send the email
    await resend.emails.send({
      from: process.env.AUTH_RESEND_FROM!,
      to: process.env.AUTH_RESEND_FROM!,
      subject: `Resume Bueno Message from ${name} (via website)`,
      text: message,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 15px; background: #f5f5f5; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    throw new MessageError('Failed to send message. Please try again later.')
  }
}
