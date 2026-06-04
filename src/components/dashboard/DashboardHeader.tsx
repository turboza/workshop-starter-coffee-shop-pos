'use client'

import { useEffect, useState } from 'react'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  const greeting = getGreeting(now.getHours())
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <h2 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>
        {greeting}, Lina
      </h2>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {dateStr} · {timeStr}
      </p>
    </div>
  )
}
