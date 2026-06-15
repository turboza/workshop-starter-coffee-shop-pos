'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

type Profile = {
  id: string
  name: string | null
  email: string | null
  role: string
  created_at: string
}

export function UsersTable({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function changeRole(target: Profile, newRole: 'cashier' | 'manager') {
    if (target.role === newRole) return

    // Warn manager they'll lose access if demoting themselves
    if (target.id === currentUserId && newRole === 'cashier') {
      const ok = confirm("You'll lose manager access after this change. Continue?")
      if (!ok) return
    }

    setError(null)
    setBusy(target.id)
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', target.id)

    setBusy(null)

    if (err) {
      // Surface friendly DB guard messages (last-manager protection etc.)
      setError(err.message ?? 'Could not update role — please try again.')
      return
    }

    router.refresh()
  }

  return (
    <div>
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: '#FEF2F2', color: 'var(--destructive)', border: '1px solid #FECACA' }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border-light)', background: 'var(--card)' }}
      >
        {/* Table header */}
        <div
          className="grid text-xs font-semibold tracking-widest uppercase px-5 py-3"
          style={{
            gridTemplateColumns: '1fr 1fr auto',
            color: 'var(--text-faint)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <span>Name / Email</span>
          <span>Joined</span>
          <span>Role</span>
        </div>

        {/* Rows */}
        {profiles.map((p, i) => (
          <div
            key={p.id}
            className="grid items-center px-5 py-4"
            style={{
              gridTemplateColumns: '1fr 1fr auto',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-light)',
            }}
          >
            {/* Name + email */}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {p.name ?? '—'}
                {p.id === currentUserId && (
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-faint)' }}>you</span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.email}</p>
            </div>

            {/* Joined date */}
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>

            {/* Role selector */}
            <div className="flex gap-2">
              {(['cashier', 'manager'] as const).map((r) => (
                <button
                  key={r}
                  disabled={busy === p.id}
                  onClick={() => changeRole(p, r)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-opacity"
                  style={
                    p.role === r
                      ? { background: 'var(--text)', color: '#fff', opacity: busy === p.id ? 0.5 : 1 }
                      : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', opacity: busy === p.id ? 0.5 : 1 }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
