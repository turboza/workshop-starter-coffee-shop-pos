export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { DashboardHeader } from '@/src/components/dashboard/DashboardHeader'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardData } from './DashboardData'
import { DashboardSkeleton } from './DashboardSkeleton'

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      {/* Mobile-only top bar */}
      <header
        className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-1 border-b"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <SidebarTrigger />
        <span className="font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</span>
      </header>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <DashboardHeader />
        <div className="flex items-center gap-2">
          <Badge variant="live" />
          <Link
            href="/"
            className="md:hidden px-3 py-1 rounded-lg text-xs font-medium"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            ← Till
          </Link>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </main>
  )
}
