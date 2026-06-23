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

function RoleModal({
  target,
  currentUserId,
  onClose,
  onSaved,
}: {
  target: Profile
  currentUserId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [selected, setSelected] = useState<'cashier' | 'manager'>(target.role as 'cashier' | 'manager')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (selected === target.role) { onClose(); return }

    if (target.id === currentUserId && selected === 'cashier') {
      const ok = confirm("You'll lose manager access after this change. Continue?")
      if (!ok) return
    }

    setError(null)
    setBusy(true)
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase
      .from('profiles')
      .update({ role: selected })
      .eq('id', target.id)

    setBusy(false)

    if (err) {
      setError(err.message ?? 'Could not update role — please try again.')
      return
    }

    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-80 rounded-2xl p-6 space-y-5 shadow-xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Change role for</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>
            {target.name ?? target.email}
          </p>
        </div>

        {/* Role options */}
        <div className="space-y-2">
          {(['manager', 'cashier'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelected(r)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={
                selected === r
                  ? { background: 'var(--primary)', border: '2px solid var(--primary)' }
                  : { background: 'var(--muted)', border: '2px solid var(--border)' }
              }
            >
              <div
                className="size-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                style={
                  selected === r
                    ? { borderColor: 'var(--primary-foreground)', background: 'var(--primary-foreground)' }
                    : { borderColor: 'var(--border)', background: 'transparent' }
                }
              >
                {selected === r && (
                  <div className="size-2 rounded-full" style={{ background: 'var(--primary)' }} />
                )}
              </div>
              <div>
                <p
                  className="text-sm font-semibold capitalize"
                  style={{ color: selected === r ? 'var(--primary-foreground)' : 'var(--foreground)' }}
                >
                  {r}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: selected === r ? 'rgba(255,255,255,0.75)' : 'var(--muted-foreground)' }}
                >
                  {r === 'manager' ? 'Till · Dashboard · Users & roles' : 'Till only'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs px-1" style={{ color: 'var(--destructive)' }}>{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserGroup({ label, profiles, currentUserId, onEdit }: {
  label: string
  profiles: Profile[]
  currentUserId: string
  onEdit: (p: Profile) => void
}) {
  if (profiles.length === 0) return null

  return (
    <div>
      {/* Group label */}
      <p
        className="text-xs font-semibold tracking-widest uppercase px-1 mb-2"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {label} · {profiles.length}
      </p>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
      >
        {/* Table header */}
        <div
          className="grid text-xs font-semibold tracking-widest uppercase px-5 py-3"
          style={{
            gridTemplateColumns: '1fr 1fr 100px 60px',
            gap: '1rem',
            color: 'var(--muted-foreground)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span>Name / Email</span>
          <span>Joined</span>
          <span>Role</span>
          <span></span>
        </div>

        {profiles.map((p, i) => (
          <div
            key={p.id}
            className="grid items-center px-5 py-4"
            style={{
              gridTemplateColumns: '1fr 1fr 100px 60px',
              gap: '1rem',
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}
          >
            {/* Name + email */}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {p.name ?? '—'}
                {p.id === currentUserId && (
                  <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>you</span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.email}</p>
            </div>

            {/* Joined date */}
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>

            {/* Role tag */}
            <span
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize justify-self-start"
              style={
                p.role === 'manager'
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
              }
            >
              {p.role}
            </span>

            {/* Edit button */}
            <button
              onClick={() => onEdit(p)}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UsersTable({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Profile | null>(null)

  // Groups: managers first, then cashiers — each group sorted by join date (oldest first, from server)
  const managers = profiles.filter((p) => p.role === 'manager')
  const cashiers = profiles.filter((p) => p.role === 'cashier')

  return (
    <div className="space-y-6">
      {editing && (
        <RoleModal
          target={editing}
          currentUserId={currentUserId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh() }}
        />
      )}

      <UserGroup label="Managers" profiles={managers} currentUserId={currentUserId} onEdit={setEditing} />
      <UserGroup label="Cashiers" profiles={cashiers} currentUserId={currentUserId} onEdit={setEditing} />
    </div>
  )
}
