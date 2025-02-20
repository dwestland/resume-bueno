'use client'

import { useEffect, useState } from 'react'

type Props = {
  initialCredits: number
  userEmail: string
}

export function UserCredits({ initialCredits, userEmail }: Props) {
  const [credits, setCredits] = useState(initialCredits)

  // Update credits when initialCredits changes
  useEffect(() => {
    setCredits(initialCredits)
  }, [initialCredits])

  // Listen for credit updates from server actions
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data?.type === 'CREDIT_UPDATE' &&
        e.data?.userEmail === userEmail &&
        typeof e.data?.credits === 'number'
      ) {
        setCredits(e.data.credits)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [userEmail])

  return (
    <p>
      Credits: <span>{credits}</span>
    </p>
  )
}
