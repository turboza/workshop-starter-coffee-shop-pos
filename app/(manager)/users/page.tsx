export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { UsersTable } from '@/src/components/users/UsersTable'

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: true })

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
          System / Users &amp; roles
        </p>
        <h1 className="font-bold text-3xl" style={{ color: 'var(--foreground)' }}>
          Users &amp; roles
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {profiles?.length ?? 0} {profiles?.length === 1 ? 'person' : 'people'} · cashiers use the till · managers also access the dashboard
        </p>
      </div>

      {/* Roles legend */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Roles &amp; permissions</h2>
        <div className="space-y-2">
          {[
            { role: 'Manager', perms: 'Till · Dashboard · Users & roles' },
            { role: 'Cashier', perms: 'Till only' },
          ].map(({ role, perms }) => (
            <div key={role} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{role}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>{perms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <UsersTable profiles={profiles ?? []} currentUserId={user!.id} />
    </main>
  )
}
