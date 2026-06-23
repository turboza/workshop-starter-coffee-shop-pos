export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsersData } from './UsersData'
import { UsersSkeleton } from './UsersSkeleton'

export default function UsersPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <header
        className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-1 border-b"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <SidebarTrigger />
        <span className="font-bold" style={{ color: 'var(--foreground)' }}>Users &amp; roles</span>
      </header>

      <div>
        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
          System / Users &amp; roles
        </p>
        <h1 className="font-bold text-2xl md:text-3xl" style={{ color: 'var(--foreground)' }}>
          Users &amp; roles
        </h1>
      </div>

      {/* Roles legend — static, paints instantly */}
      <Card>
        <CardHeader>
          <CardTitle>Roles &amp; permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {[
              { role: 'Manager', perms: 'Till · Dashboard · Users & roles', variant: 'default' as const },
              { role: 'Cashier', perms: 'Till only', variant: 'secondary' as const },
            ].map(({ role, perms, variant }) => (
              <div key={role} className="flex items-center gap-2">
                <Badge variant={variant}>{role}</Badge>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{perms}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersData />
      </Suspense>
    </main>
  )
}
