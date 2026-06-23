'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { TopLoadingBar } from '@/src/components/ui/TopLoadingBar'

export function DashboardLink() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) setRole(profile.role)
        })
    })
  }, [])

  if (role !== 'manager') return null

  return (
    <Link
      href="/dashboard"
      className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-accent"
      style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
    >
      <TopLoadingBar />
      Dashboard
    </Link>
  )
}
