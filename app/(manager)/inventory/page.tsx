export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { MobilePageHeader } from '@/src/components/ui/MobilePageHeader'
import { InventoryData } from './InventoryData'
import { InventorySkeleton } from './InventorySkeleton'

export default function InventoryPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <MobilePageHeader title="Inventory" />

      <Suspense fallback={<InventorySkeleton />}>
        <InventoryData />
      </Suspense>
    </main>
  )
}
