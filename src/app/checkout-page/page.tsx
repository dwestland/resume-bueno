'use server'

import { redirect } from 'next/navigation'

interface CheckoutPageProps {
  searchParams: {
    plan?: string
  }
}

export default async function CheckoutPageRedirect({
  searchParams,
}: CheckoutPageProps) {
  // Await searchParams
  const params = await searchParams
  const { plan } = params

  // Redirect to the new checkout path
  redirect(`/checkout${plan ? `?plan=${plan}` : ''}`)
}
