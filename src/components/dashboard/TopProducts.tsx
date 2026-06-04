'use client'

import { useState } from 'react'

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
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          Top products
        </h3>
        <div className="flex gap-1 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {(['TODAY', 'WEEK', 'MONTH'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 text-xs font-semibold"
              style={{
                background: period === p ? 'var(--text)' : 'transparent',
                color: period === p ? '#fff' : 'var(--text-muted)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-faint)' }}>
          No orders yet
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.rank} className="flex items-center gap-3">
              <span className="text-sm w-4 shrink-0" style={{ color: 'var(--text-muted)' }}>
                {item.rank}
              </span>
              <span className="text-sm font-medium w-28 shrink-0" style={{ color: 'var(--text)' }}>
                {item.name}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    background: 'var(--accent)',
                  }}
                />
              </div>
              <span className="text-sm w-8 text-right shrink-0" style={{ color: 'var(--text)' }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
