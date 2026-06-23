export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { DashboardHeader } from '@/src/components/dashboard/DashboardHeader'
import { MobilePageHeader } from '@/src/components/ui/MobilePageHeader'
import { DashboardData } from './DashboardData'
import { DashboardSkeleton } from './DashboardSkeleton'

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      <MobilePageHeader title="Dashboard" />

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
