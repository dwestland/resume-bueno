'use client'

import React, { useEffect, useState } from 'react'

const EnvironmentIndicator: React.FC = () => {
  const [envIndicator, setEnvIndicator] = useState<string | null>(null)

  useEffect(() => {
    const { host } = window.location
    if (host.includes('localhost')) {
      setEnvIndicator('LOCALHOST')
    } else if (host.includes('stage.resumebueno.com')) {
      setEnvIndicator('STAGING')
    } else if (host.includes('vercel.app')) {
      setEnvIndicator('VERCEL DOMAIN')
    } else {
      setEnvIndicator(null) // Show nothing if not localhost or stage
    }
  }, [])

  if (!envIndicator) return null

  return (
    <div className="container">
      <p className="text-xl font-bold text-center text-crimson">
        {envIndicator}
      </p>
    </div>
  )
}

export default EnvironmentIndicator
