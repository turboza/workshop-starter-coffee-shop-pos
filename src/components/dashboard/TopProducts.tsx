'use client'

import { useState } from 'react'
import { topProductsToday, topProductsWeek, topProductsMonth } from '@/src/data/stats'

type Period = 'TODAY' | 'WEEK' | 'MONTH'

const DATA: Record<Period, { rank: number; name: string; count: number }[]> = {
  TODAY: topProductsToday,
  WEEK: topProductsWeek,
  MONTH: topProductsMonth,
}

export function TopProducts() {
  const [period, setPeriod] = useState<Period>('TODAY')
  const items = DATA[period]
  const maxCount = items[0]?.count ?? 1

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
            Top products
          </h3>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}
          >
            sample
          </span>
        </div>
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
    </div>
  )
}
