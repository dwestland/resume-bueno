'use client'

import { useEffect, useState } from 'react'

type Props = {
  initialCreditBalance: number
  userEmail: string
}

export function UserCredits({ initialCreditBalance, userEmail }: Props) {
  const [creditBalance, setCreditBalance] = useState(initialCreditBalance)

  // Update credit balance when initialCreditBalance changes
  useEffect(() => {
    setCreditBalance(initialCreditBalance)
  }, [initialCreditBalance])

  // Listen for credit updates from server actions
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data?.type === 'CREDIT_UPDATE' &&
        e.data?.userEmail === userEmail &&
        typeof e.data?.credit_balance === 'number'
      ) {
        setCreditBalance(e.data.credit_balance)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [userEmail])

  return (
    <span>
      Credits: <span className="text-2xl font-semibold">{creditBalance}</span>
    </span>
  )
}
