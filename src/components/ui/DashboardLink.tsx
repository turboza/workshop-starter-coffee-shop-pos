'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

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
      className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-lg border"
      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
    >
      Dashboard
    </Link>
  )
}
