'use client'

import { hourlyRevenue } from '@/src/data/stats'

export function HourlyChart() {
  const max = Math.max(...hourlyRevenue.map((h) => h.revenue))

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          Hourly revenue
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          color = ฿ · 07:00–20:00
        </span>
      </div>

      <div className="flex items-end gap-1 h-24">
        {hourlyRevenue.map((h) => {
          const heightPct = (h.revenue / max) * 100
          const intensity = Math.round((h.revenue / max) * 100)
          return (
            <div key={h.hour} className="flex flex-col items-center flex-1 min-w-0 gap-1">
              <div className="flex flex-col justify-end w-full" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-sm flex items-end justify-center relative group"
                  style={{
                    height: `${heightPct}%`,
                    background: `hsl(213, ${30 + intensity * 0.5}%, ${70 - intensity * 0.35}%)`,
                    minHeight: '4px',
                  }}
                >
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: 'var(--text)', color: '#fff', zIndex: 10 }}
                  >
                    ฿{h.revenue}
                  </div>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {h.hour}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
