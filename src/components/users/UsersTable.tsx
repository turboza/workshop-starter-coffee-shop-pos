'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

type Profile = {
  id: string
  name: string | null
  email: string | null
  role: string
  created_at: string
}

function RoleDialog({
  target,
  currentUserId,
  open,
  onOpenChange,
  onSaved,
}: {
  target: Profile | null
  currentUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [selected, setSelected] = useState<'cashier' | 'manager'>('cashier')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && target) {
      setSelected(target.role as 'cashier' | 'manager')
      setError(null)
    }
  }, [open, target?.id])

  async function handleSave() {
    if (!target) return
    if (selected === target.role) { onOpenChange(false); return }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Change role for</p>
          <DialogTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {target?.name ?? target?.email}
          </DialogTitle>
        </DialogHeader>

        {/* Role options */}
        <div className="flex flex-col gap-2">
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy} className="flex-1">
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
      <p
        className="text-xs font-semibold tracking-widest uppercase px-1 mb-2"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {label} · {profiles.length}
      </p>

      <Card>
        {/* Mobile: stacked list (hidden on md+) */}
        <CardContent className="md:hidden px-0 py-0">
          {profiles.map((p, i) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 px-5 py-4"
              style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
            >
              {/* Name + email row */}
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {p.name ?? '—'}
                  {p.id === currentUserId && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>you</span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.email}</p>
              </div>

              {/* Date + badge + edit row */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {formatDate(p.created_at)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={p.role === 'manager' ? 'default' : 'secondary'} className="capitalize">
                    {p.role}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Desktop: table (hidden below md) */}
        <CardContent className="hidden md:block px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>Name / Email</TableHead>
                <TableHead className="px-5 text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>Joined</TableHead>
                <TableHead className="px-5 text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>Role</TableHead>
                <TableHead className="px-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="px-5 py-4">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {p.name ?? '—'}
                      {p.id === currentUserId && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>you</span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.email}</p>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(p.created_at)}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge variant={p.role === 'manager' ? 'default' : 'secondary'} className="capitalize">
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function UsersTable({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Profile | null>(null)

  const managers = profiles.filter((p) => p.role === 'manager')
  const cashiers = profiles.filter((p) => p.role === 'cashier')

  return (
    <div className="flex flex-col gap-6">
      <RoleDialog
        target={editing}
        currentUserId={currentUserId}
        open={editing !== null}
        onOpenChange={(open) => { if (!open) setEditing(null) }}
        onSaved={() => { setEditing(null); router.refresh() }}
      />

      <UserGroup label="Managers" profiles={managers} currentUserId={currentUserId} onEdit={setEditing} />
      <UserGroup label="Cashiers" profiles={cashiers} currentUserId={currentUserId} onEdit={setEditing} />
    </div>
  )
}
