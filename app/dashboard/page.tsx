import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { StatCard } from '@/src/components/dashboard/StatCard'
import { HourlyChart } from '@/src/components/dashboard/HourlyChart'
import { TopProducts } from '@/src/components/dashboard/TopProducts'
import { LiveFeed } from '@/src/components/dashboard/LiveFeed'
import { todayStats } from '@/src/data/stats'
import { supabase } from '@/src/lib/supabase'
import { Order } from '@/src/types'

async function fetchTodayOrders(): Promise<Order[]> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      cashier,
      payment_method,
      cash_received,
      change,
      subtotal,
      vat,
      total,
      created_at,
      order_items (
        product_name,
        unit_price,
        quantity,
        size,
        milk,
        extras,
        note
      )
    `)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Failed to fetch orders:', error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    cashier: row.cashier,
    paymentMethod: row.payment_method as 'cash' | 'card',
    cashReceived: row.cash_received ?? undefined,
    change: row.change ?? undefined,
    subtotal: row.subtotal,
    vat: row.vat,
    total: row.total,
    timestamp: new Date(row.created_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    voided: false,
    items: (row.order_items ?? []).map((item: {
      product_name: string
      unit_price: number
      quantity: number
      size: string | null
      milk: string | null
      extras: string[] | null
      note: string | null
    }) => ({
      id: crypto.randomUUID(),
      product: {
        id: '',
        name: item.product_name,
        category: 'Coffee' as const,
        price: item.unit_price,
      },
      options: {
        size: (item.size ?? undefined) as Order['items'][0]['options']['size'],
        milk: (item.milk ?? undefined) as Order['items'][0]['options']['milk'],
        extras: (item.extras ?? undefined) as Order['items'][0]['options']['extras'],
        note: item.note ?? undefined,
      },
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
  }))
}

export default async function DashboardPage() {
  const orders = await fetchTodayOrders()

  const nonVoided = orders.filter((o) => !o.voided)
  const realRevenue = nonVoided.reduce((sum, o) => sum + o.total, 0)
  const realTransactions = nonVoided.length

  // Build hourly revenue from today's fetched orders (7am–8pm)
  const hourlyMap = new Map<number, number>()
  for (let h = 7; h <= 20; h++) hourlyMap.set(h, 0)
  for (const order of nonVoided) {
    const hour = parseInt(order.timestamp.split(':')[0], 10)
    if (hourlyMap.has(hour)) {
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + order.total)
    }
  }
  const hourlyRevenue = Array.from(hourlyMap, ([hour, revenue]) => ({ hour, revenue }))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-48 lg:w-56 shrink-0 p-4 gap-6"
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border-light)' }}
      >
        {/* Brand */}
        <div className="pt-2">
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
            Lina&apos;s POS
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Lina · owner</p>
        </div>

        {/* Nav */}
        <nav>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-faint)' }}>
            Operate
          </p>
          <ul className="space-y-1">
            <li>
              <span
                className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--text)', color: '#fff' }}
              >
                Dashboard
              </span>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Live feed
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Back to till
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>
              Good morning, Lina
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Tue 11 May · 07:38
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="live" />
            <Link
              href="/"
              className="md:hidden px-3 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}
            >
              ← Till
            </Link>
          </div>
        </div>

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

        {/* Hourly chart */}
        <HourlyChart hourlyRevenue={hourlyRevenue} />

        {/* Top products */}
        <TopProducts />

        {/* Live feed */}
        <LiveFeed orders={orders} />
      </main>
    </div>
  )
}
