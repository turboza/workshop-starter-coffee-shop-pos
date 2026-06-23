import { TopProducts } from '@/src/components/dashboard/TopProducts'
import { SalesMix } from '@/src/components/dashboard/SalesMix'
import { LiveFeed } from '@/src/components/dashboard/LiveFeed'
import { DashboardLive } from '@/src/components/dashboard/DashboardLive'
import { createSupabaseServerClient } from '@/src/lib/supabase-server'
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

export async function DashboardData() {
  const [orders, rawItems] = await Promise.all([fetchTodayOrders(), fetchMonthItems()])
  const rawOrders = orders.map((o) => ({ total: o.total, createdAt: o.timestamp }))

  return (
    <>
      <DashboardLive rawOrders={rawOrders} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProducts rawItems={rawItems} />
        <SalesMix rawItems={rawItems} />
      </div>
      <LiveFeed orders={orders} />
    </>
  )
}
