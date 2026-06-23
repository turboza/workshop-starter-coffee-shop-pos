'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { TopLoadingBar } from '@/src/components/ui/TopLoadingBar'
import { buttonVariants } from '@/components/ui/button'

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
      className={buttonVariants({
        variant: 'outline',
        size: 'sm',
        className: 'bg-white dark:bg-white dark:text-black dark:hover:bg-white/90',
      })}
    >
      <TopLoadingBar />
      Dashboard
    </Link>
  )
}
