export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { InventoryData } from './InventoryData'
import { InventorySkeleton } from './InventorySkeleton'

export default function InventoryPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <header
        className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-1 border-b"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <SidebarTrigger />
        <span className="font-bold" style={{ color: 'var(--foreground)' }}>Inventory</span>
      </header>

      <Suspense fallback={<InventorySkeleton />}>
        <InventoryData />
      </Suspense>
    </main>
  )
}
