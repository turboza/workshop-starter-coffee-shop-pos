'use client'

import { StatCard } from './StatCard'
import { HourlyChart } from './HourlyChart'
import { todayStats } from '@/src/data/stats'

type RawOrder = { total: number; createdAt: string }

function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function DashboardLive({ rawOrders }: { rawOrders: RawOrder[] }) {
  const todayOrders = rawOrders.filter((o) => isToday(o.createdAt))
  const realRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const realTransactions = todayOrders.length

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Revenue · Today"
          value={`฿${realRevenue.toLocaleString()}`}
          sub={realTransactions > 0 ? `${realTransactions} orders` : 'No orders yet'}
          subPositive={realTransactions > 0}
        />
        <StatCard
          label="Transactions"
          value={`${realTransactions}`}
          sub={realTransactions > 0 ? 'orders today' : 'No orders yet'}
        />
        <StatCard
          label="Avg Ticket"
          value={`฿${todayStats.avgTicket}`}
          sub={todayStats.avgTicketChange}
          subPositive={true}
          sample
        />
        <StatCard
          label="Voids Today"
          value={`${todayStats.voids}`}
          sub={todayStats.voidsNote}
          sample
        />
      </div>

      {/* Hourly chart — HourlyChart buckets by local hour internally */}
      <HourlyChart orders={todayOrders} />
    </>
  )
}
