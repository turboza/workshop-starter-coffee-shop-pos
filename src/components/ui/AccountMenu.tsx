'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

export function AccountMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = email ? email[0].toUpperCase() : '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white select-none"
        style={{ background: 'var(--accent)' }}
        title={email ?? 'Account'}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 w-52 rounded-xl shadow-lg py-1 z-50"
          style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
        >
          {email && (
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm"
            style={{ color: 'var(--text)' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
