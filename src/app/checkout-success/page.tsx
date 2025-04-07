'use server'

import { redirect } from 'next/navigation'

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function SuccessPageRedirect({
  searchParams,
}: SuccessPageProps) {
  // Await searchParams
  const params = await searchParams
  const { session_id } = params

  // Redirect to the new success path
  redirect(`/checkout/success${session_id ? `?session_id=${session_id}` : ''}`)
}
