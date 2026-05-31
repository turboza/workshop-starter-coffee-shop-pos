'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/src/context/CartContext'

export function CartPanel() {
  const router = useRouter()
  const { items, orderNumber, subtotal, vat, total, removeItem, updateQty } = useCart()

  function formatOptions(options: Record<string, unknown>): string {
    const parts: string[] = []
    if (options.size && options.size !== 'S 12oz') parts.push(options.size as string)
    if (options.milk && options.milk !== 'Whole') parts.push(options.milk as string)
    if (Array.isArray(options.extras)) {
      options.extras.forEach((e: unknown) => parts.push(e as string))
    }
    if (options.note) parts.push(options.note as string)
    return parts.join(' · ')
  }

  return (
    <div
      className="flex flex-col h-full rounded-xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Order #{orderNumber}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <div className="text-3xl">☕</div>
            <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
              Tap a product to add it
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => {
              const optStr = formatOptions(item.options as Record<string, unknown>)
              return (
                <li key={item.id} className="py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {item.product.name}
                        {optStr && (
                          <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                            {' · '}{optStr}
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        ฿{item.unitPrice} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        ฿{item.unitPrice * item.quantity}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded text-xs flex items-center justify-center"
                          style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}
                        >
                          −
                        </button>
                        <span className="text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded text-xs flex items-center justify-center"
                          style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-5 h-5 rounded text-xs flex items-center justify-center ml-1"
                          style={{ background: 'var(--destructive-bg)', color: 'var(--destructive)' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        {items.length > 0 && (
          <>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              + Add note · Discount · Customer phone
            </p>
            <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--text)' }}>฿{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>VAT 7% inc.</span>
                <span style={{ color: 'var(--text)' }}>฿{vat}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span style={{ color: 'var(--text)' }}>Total</span>
                <span style={{ color: 'var(--text)' }}>฿{total}</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={() => items.length > 0 && router.push('/payment')}
          disabled={items.length === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{
            background: items.length > 0 ? 'var(--accent)' : 'var(--border)',
            cursor: items.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {items.length > 0 ? `Charge · ฿${total}` : 'No items'}
        </button>
      </div>
    </div>
  )
}
