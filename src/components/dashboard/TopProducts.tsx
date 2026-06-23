'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Period = 'TODAY' | 'WEEK' | 'MONTH'
type Item = { rank: number; name: string; count: number }

export type RawItem = { productName: string; quantity: number; createdAt: string }

function inWindow(isoString: string, days: number): boolean {
  return new Date(isoString) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function buildTop(rawItems: RawItem[], filter: (iso: string) => boolean): Item[] {
  const counts = new Map<string, number>()
  for (const item of rawItems) {
    if (!filter(item.createdAt)) continue
    counts.set(item.productName, (counts.get(item.productName) ?? 0) + item.quantity)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], i) => ({ rank: i + 1, name, count }))
}

export function TopProducts({ rawItems }: { rawItems: RawItem[] }) {
  const [period, setPeriod] = useState<Period>('TODAY')

  const items: Item[] =
    period === 'TODAY' ? buildTop(rawItems, isToday) :
    period === 'WEEK'  ? buildTop(rawItems, (iso) => inWindow(iso, 7)) :
                         buildTop(rawItems, (iso) => inWindow(iso, 30))
  const maxCount = items[0]?.count ?? 1

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
          Top products
        </h3>
        <ToggleGroup
          value={[period]}
          onValueChange={(vals) => { if (vals.length > 0) setPeriod(vals[vals.length - 1] as Period) }}
          variant="outline"
          size="sm"
          spacing={0}
        >
          <ToggleGroupItem value="TODAY">Today</ToggleGroupItem>
          <ToggleGroupItem value="WEEK">Week</ToggleGroupItem>
          <ToggleGroupItem value="MONTH">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {items.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
          No orders yet
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.rank} className="flex items-center gap-3">
              <span className="text-sm w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {item.rank}
              </span>
              <span className="text-sm font-medium min-w-0 flex-1 truncate" style={{ color: 'var(--foreground)' }}>
                {item.name}
              </span>
              <div className="w-20 sm:w-32 md:flex-1 h-3 rounded-full overflow-hidden shrink-0" style={{ background: 'var(--muted)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    background: 'var(--primary)',
                  }}
                />
              </div>
              <span className="text-sm w-8 text-right shrink-0" style={{ color: 'var(--foreground)' }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
