export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { TopProducts } from '@/src/components/dashboard/TopProducts'
import { LiveFeed } from '@/src/components/dashboard/LiveFeed'
import { DashboardLive } from '@/src/components/dashboard/DashboardLive'
import { DashboardHeader } from '@/src/components/dashboard/DashboardHeader'
import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Order } from '@/src/types'

type RawItem = { productName: string; quantity: number; createdAt: string }

async function fetchMonthItems(): Promise<RawItem[]> {
  const supabase = await createSupabaseServerClient()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, quantity, orders!inner(created_at)')
    .gte('orders.created_at', cutoff.toISOString())

  if (error || !data) {
    console.error('Failed to fetch month items:', error)
    return []
  }

  return data.map((row) => ({
    productName: row.product_name,
    quantity: row.quantity,
    createdAt: (row.orders as unknown as { created_at: string }).created_at,
  }))
}

async function fetchTodayOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient()
  // Fetch last 48h — the client filters to "today" using browser local time
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)

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
    .gte('created_at', cutoff.toISOString())
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
    timestamp: row.created_at,
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
  const [orders, rawItems] = await Promise.all([fetchTodayOrders(), fetchMonthItems()])

  // Pass raw ISO timestamps to client — revenue/count/hourly computed there using browser timezone
  const rawOrders = orders.map((o) => ({ total: o.total, createdAt: o.timestamp }))

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      {/* Mobile-only top bar — holds sidebar trigger so nav is reachable on phones */}
      <header
        className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-1 border-b"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <SidebarTrigger />
        <span className="font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</span>
      </header>
      {/* TODO: same mobile trigger needed on other manager pages (inventory, users) */}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <DashboardHeader />
        <div className="flex items-center gap-2">
          <Badge variant="live" />
          <Link
            href="/"
            className="md:hidden px-3 py-1 rounded-lg text-xs font-medium"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            ← Till
          </Link>
        </div>
      </div>

      {/* Stat cards + hourly chart — rendered client-side for correct local timezone */}
      <DashboardLive rawOrders={rawOrders} />

      {/* Top products */}
      <TopProducts rawItems={rawItems} />

      {/* Live feed */}
      <LiveFeed orders={orders} />
    </main>
  )
}
