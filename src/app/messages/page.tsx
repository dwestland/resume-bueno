'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { sendMessage } from './actions'

interface MessageFormData {
  name: string
  email: string
  message: string
}

export default function MessagesPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>()

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const onSubmit = async (data: MessageFormData) => {
    try {
      setSubmitStatus(null)
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      await sendMessage(formData)
      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully!',
      })
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Send a Message</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="p-2 border rounded text-[#0a0a0a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="p-2 border rounded text-[#0a0a0a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="mb-1 font-semibold">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className="p-2 border rounded text-[#0a0a0a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('message', {
              required: 'Message is required',
              minLength: {
                value: 10,
                message: 'Message must be at least 10 characters',
              },
              maxLength: {
                value: 1000,
                message: 'Message must not exceed 1000 characters',
              },
            })}
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>

        {submitStatus && (
          <div
            className={`mt-4 p-3 rounded ${
              submitStatus.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  )
}
