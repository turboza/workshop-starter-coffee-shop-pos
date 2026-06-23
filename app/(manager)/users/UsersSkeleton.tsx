import { Skeleton } from '@/components/ui/skeleton'

export function UsersSkeleton() {
  return (
    <div className="space-y-3 mt-2">
      {/* Table header */}
      <Skeleton className="h-8 rounded-lg w-full" />
      {/* Table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-lg w-full" />
      ))}
    </div>
  )
}
