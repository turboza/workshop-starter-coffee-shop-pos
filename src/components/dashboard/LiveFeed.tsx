import { Badge } from '@/src/components/ui/Badge'
import { Order } from '@/src/types'

export function LiveFeed({ orders }: { orders: Order[] }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          Live feed
        </h3>
        <Badge variant="live" />
      </div>

      <div className="space-y-0">
        {orders.map((order, i) => {
          const itemSummary = order.items
            .map((item) => {
              const opts: string[] = []
              if (item.options.milk && item.options.milk !== 'Whole') opts.push(item.options.milk)
              const base = item.quantity > 1 ? `${item.product.name} × ${item.quantity}` : item.product.name
              return opts.length ? `${base} · ${opts.join(' ')}` : base
            })
            .join(' · ')

          return (
            <div
              key={order.id}
              className="flex items-start justify-between py-3 gap-3"
              style={{
                borderBottom: i < orders.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <div className="flex gap-4 min-w-0 flex-1">
                <span className="text-sm shrink-0 w-10" style={{ color: 'var(--text-muted)' }}>
                  {order.timestamp}
                </span>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: order.voided ? 'var(--text-muted)' : 'var(--text)' }}
                  >
                    {order.voided ? `Void · ${order.voidReason}` : itemSummary}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {order.cashier} · {order.voided ? 'void' : order.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="font-display font-bold text-lg"
                  style={{
                    color: order.voided ? 'var(--destructive)' : 'var(--text)',
                  }}
                >
                  {order.voided ? `−฿${order.total}` : `฿${order.total}`}
                </span>
                {i === 0 && !order.voided && <Badge variant="new" />}
                {order.voided && <Badge variant="void" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
