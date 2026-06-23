'use client'

type RawOrder = { total: number; createdAt: string }

export function HourlyChart({ orders }: { orders: RawOrder[] }) {
  // Bucket by local hour using the browser's timezone
  const hourlyMap = new Map<number, number>()
  for (let h = 7; h <= 20; h++) hourlyMap.set(h, 0)
  for (const order of orders) {
    const hour = new Date(order.createdAt).getHours()
    if (hourlyMap.has(hour)) {
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + order.total)
    }
  }
  const hourlyRevenue = Array.from(hourlyMap, ([hour, revenue]) => ({ hour, revenue }))
  const max = Math.max(...hourlyRevenue.map((h) => h.revenue), 1)

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
          Hourly revenue
        </h3>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          07:00–20:00
        </span>
      </div>

      <div className="flex items-end gap-1 h-24">
        {hourlyRevenue.map((h) => {
          const heightPct = (h.revenue / max) * 100
          const intensity = h.revenue / max
          return (
            <div key={h.hour} className="flex flex-col items-center flex-1 min-w-0 gap-1">
              <div className="flex flex-col justify-end w-full" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-sm flex items-end justify-center relative group"
                  style={{
                    height: `${heightPct}%`,
                    background: `oklch(${0.6716 + intensity * 0.05} ${0.1368 * (0.4 + intensity * 0.6)} 48.513)`,
                    minHeight: '4px',
                  }}
                >
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: 'var(--foreground)', color: 'var(--background)', zIndex: 10 }}
                  >
                    ฿{h.revenue}
                  </div>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                {h.hour}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
