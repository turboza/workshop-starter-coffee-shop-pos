export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { LogoutButton } from '@/src/components/ui/LogoutButton'
import { UsersTable } from '@/src/components/users/UsersTable'

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'manager') {
    redirect('/?denied=managers-only')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar — same as dashboard */}
      <aside
        className="hidden md:flex flex-col w-48 lg:w-56 shrink-0 p-4 gap-6"
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border-light)' }}
      >
        <div className="pt-2">
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
            Lina&apos;s POS
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>manager</p>
        </div>

        <nav className="flex-1">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-faint)' }}>
            Operate
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <span
                className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--text)', color: '#fff' }}
              >
                Users &amp; roles
              </span>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Back to till
              </Link>
            </li>
          </ul>
        </nav>

        <LogoutButton
          className="flex items-center px-3 py-2 rounded-lg text-sm w-full text-left"
          style={{ color: 'var(--text-muted)' }}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
            System / Users &amp; roles
          </p>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>
            Users &amp; roles
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {profiles?.length ?? 0} {profiles?.length === 1 ? 'person' : 'people'} · cashiers use the till · managers also access the dashboard
          </p>
        </div>

        {/* Roles legend */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Roles &amp; permissions</h2>
          <div className="space-y-2">
            {[
              { role: 'Manager', perms: 'Till · Dashboard · Users & roles' },
              { role: 'Cashier', perms: 'Till only' },
            ].map(({ role, perms }) => (
              <div key={role} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{role}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{perms}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <UsersTable profiles={profiles ?? []} currentUserId={user!.id} />
      </main>
    </div>
  )
}
