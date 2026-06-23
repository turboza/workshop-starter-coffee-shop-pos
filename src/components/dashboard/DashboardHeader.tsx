'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.name
      if (n) setName(n)
    })
  }, [])

  if (!now) return null

  const greeting = getGreeting(now.getHours())
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <h2 className="font-bold text-2xl md:text-3xl" style={{ color: 'var(--foreground)' }}>
        {greeting}{name ? `, ${name}` : ''}
      </h2>
      <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
        {dateStr} · {timeStr}
      </p>
    </div>
  )
}
