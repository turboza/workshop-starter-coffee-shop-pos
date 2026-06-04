'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/src/context/CartContext'

export default function ReceiptPage() {
  const router = useRouter()
  const { completedOrder, clearCart } = useCart()
  const [countdown, setCountdown] = useState(5)
  const [toast, setToast] = useState<string | null>(null)

  function handleNewOrder() {
    clearCart()
    router.push('/')
  }

  useEffect(() => {
    if (!completedOrder) {
      router.push('/')
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0 && completedOrder) {
      handleNewOrder()
    }
  }, [countdown])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  if (!completedOrder) return null

  const order = completedOrder
  const dateStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

  function formatOptions(opts: Record<string, unknown>): string {
    const parts: string[] = []
    if (opts.size && opts.size !== 'S 12oz') parts.push(opts.size as string)
    if (opts.milk && opts.milk !== 'Whole') parts.push(opts.milk as string)
    if (Array.isArray(opts.extras)) opts.extras.forEach((e: unknown) => parts.push(e as string))
    return parts.join(' · ')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ background: 'var(--bg)' }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-50"
          style={{ background: 'var(--text)', color: '#fff' }}
        >
          {toast}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Done header */}
        <h1 className="font-display font-bold text-center mb-2" style={{ fontSize: '4rem', color: 'var(--text)' }}>
          Done!
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Order #{order.id} · paid ฿{order.total}{' '}
          {order.paymentMethod === 'cash' ? 'cash' : 'card'}
        </p>

        {/* Receipt card */}
        <div
          className="rounded-2xl overflow-hidden shadow-md"
          style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
        >
          <div className="p-6 font-mono text-sm" style={{ color: 'var(--text)' }}>
            {/* Shop header */}
            <div className="text-center mb-4">
              <p className="font-bold text-base">Lina&apos;s Coffee</p>
              <p style={{ color: 'var(--text-muted)' }}>Ekkamai · Bangkok</p>
              <p style={{ color: 'var(--text-muted)' }}>
                {dateStr} · {order.timestamp}
              </p>
            </div>

            <p style={{ color: 'var(--border)' }}>{'—'.repeat(42)}</p>

            {/* Line items */}
            <div className="my-3 space-y-1">
              {order.items.map((item) => {
                const opts = formatOptions(item.options as Record<string, unknown>)
                return (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="flex-1 truncate">
                      {item.quantity}× {item.product.name}
                      {opts && <span style={{ color: 'var(--text-muted)' }}> · {opts}</span>}
                    </span>
                    <span className="shrink-0">฿{item.unitPrice * item.quantity}</span>
                  </div>
                )
              })}
            </div>

            <p style={{ color: 'var(--border)' }}>{'—'.repeat(42)}</p>

            {/* Totals */}
            <div className="my-3 space-y-1">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>฿{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>VAT inc.</span>
                <span>฿{order.vat}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-1">
                <span>Total</span>
                <span>฿{order.total}</span>
              </div>
              {order.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Cash</span>
                    <span>฿{order.cashReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Change</span>
                    <span>฿{order.change}</span>
                  </div>
                </>
              )}
            </div>

            <p style={{ color: 'var(--border)' }}>{'—'.repeat(42)}</p>

            {/* Footer */}
            <div className="text-center mt-3" style={{ color: 'var(--text-muted)' }}>
              <p>Thank you!</p>
              <p>#{order.id} · {order.cashier}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-6 justify-center flex-wrap">
          {['Print', 'Email', 'SMS'].map((action) => (
            <button
              key={action}
              onClick={() => showToast(`${action}: Not connected yet`)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {action}
            </button>
          ))}
          <button
            onClick={handleNewOrder}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            New order
          </button>
        </div>

        {/* Countdown */}
        <p className="text-center text-xs mt-4 italic" style={{ color: 'var(--text-muted)' }}>
          auto-returns to till in {countdown}s ↺
        </p>
      </div>
    </div>
  )
}
