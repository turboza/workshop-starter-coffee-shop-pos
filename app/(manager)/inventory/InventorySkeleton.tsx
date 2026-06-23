import { Skeleton } from '@/components/ui/skeleton'

export function InventorySkeleton() {
  return (
    <div className="space-y-3 mt-4">
      {/* Table header */}
      <Skeleton className="h-8 rounded-lg w-full" />
      {/* Table rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-lg w-full" />
      ))}
    </div>
  )
}
