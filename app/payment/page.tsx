'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/src/context/CartContext'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

const QUICK_CASH = [100, 200, 300, 500, 1000]

export default function PaymentPage() {
  const router = useRouter()
  const { items, total, subtotal, vat, orderNumber, cashier, completeOrder } = useCart()
  const [method, setMethod] = useState<'cash' | 'card'>('cash')
  const [received, setReceived] = useState<number | null>(null)
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items.length, router])

  const exactAmount = total
  const quickOptions = [
    ...QUICK_CASH.filter((a) => a < total),
    exactAmount,
    ...QUICK_CASH.filter((a) => a > total),
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 6)

  const change = received !== null ? received - total : null

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    completeOrder(method, method === 'cash' ? (received ?? total) : undefined)

    const cashReceived = method === 'cash' ? (received ?? total) : null
    const changeAmount = cashReceived !== null ? cashReceived - total : null
    const supabase = createSupabaseBrowserClient()

    const { data: userData } = await supabase.auth.getUser()
    const resolvedCashier = userData?.user?.user_metadata?.name ?? cashier

    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        cashier: resolvedCashier,
        payment_method: method,
        cash_received: cashReceived,
        change: changeAmount,
        subtotal,
        vat,
        total,
      })
      .select('id')
      .single()

    if (orderError || !savedOrder) {
      console.error('Failed to save order:', orderError)
      router.push('/receipt')
      return
    }

    const lineItems = items.map((item) => ({
      order_id: savedOrder.id,
      product_name: item.product.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      size: item.options.size ?? null,
      milk: item.options.milk ?? null,
      extras: item.options.extras ?? null,
      note: item.options.note ?? null,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(lineItems)

    if (itemsError) {
      console.error('Failed to save order items:', itemsError)
    }

    router.push('/receipt')
  }

  function handleCancel() {
    router.push('/')
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ background: 'var(--background)' }}>
      {/* Left panel */}
      <div className="flex flex-col flex-1 p-6 md:p-10 gap-6">
        {/* Order summary header */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>
            PAYMENT · ORDER #{orderNumber}
          </p>
          <p className="font-bold" style={{ fontSize: '4rem', lineHeight: 1, color: 'var(--foreground)' }}>
            ฿{total}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {items.reduce((s, i) => s + i.quantity, 0)} items · {cashier}
          </p>
        </div>

        {/* Items summary */}
        <div
          className="rounded-xl p-4 space-y-1.5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span style={{ color: 'var(--foreground)' }}>
                {item.quantity}× {item.product.name}
                {item.options.milk && item.options.milk !== 'Whole' && (
                  <span style={{ color: 'var(--muted-foreground)' }}> · {item.options.milk}</span>
                )}
              </span>
              <span style={{ color: 'var(--foreground)' }}>฿{item.unitPrice * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Payment method</p>
          <div className="flex gap-3">
            {(['cash', 'card'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className="flex-1 py-5 rounded-xl border-2 text-center"
                style={{
                  background: method === m ? 'var(--primary)' : 'var(--card)',
                  borderColor: method === m ? 'var(--primary)' : 'var(--border)',
                  color: method === m ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <p className="font-bold text-2xl capitalize">{m === 'cash' ? 'Cash' : 'Card'}</p>
                <p className="text-xs mt-1" style={{ color: method === m ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)' }}>
                  {m === 'cash' ? 'THB' : 'visa · master'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Customer phone (optional) */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Customer (optional)</p>
          <input
            type="tel"
            placeholder="phone number for loyalty…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--card)',
              border: `1.5px dashed var(--border)`,
              color: 'var(--foreground)',
            }}
          />
          <p className="text-xs mt-1 italic" style={{ color: 'var(--muted-foreground)' }}>
            ↑ skips silently if left blank
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="flex flex-col w-full md:w-80 lg:w-96 p-6 gap-4 shrink-0"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
      >
        {method === 'cash' ? (
          <>
            <div>
              <p className="font-bold text-xl mb-4" style={{ color: 'var(--foreground)' }}>Cash drawer</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Owed</span>
                  <span style={{ color: 'var(--foreground)' }}>฿{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Received</span>
                  <span style={{ color: 'var(--foreground)' }}>{received !== null ? `฿${received}` : '—'}</span>
                </div>
                <hr style={{ borderColor: 'var(--border)' }} />
                <div className="flex justify-between text-sm font-semibold">
                  <span style={{ color: 'var(--muted-foreground)' }}>Change</span>
                  <span style={{ color: change !== null && change >= 0 ? 'oklch(0.527 0.154 150)' : 'var(--destructive)' }}>
                    {change !== null ? `฿${change}` : '฿—'}
                  </span>
                </div>
              </div>

              <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Quick cash</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickOptions.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setReceived(amt)}
                    className="py-2.5 rounded-xl text-sm font-semibold border"
                    style={{
                      background: received === amt ? 'var(--primary)' : 'var(--background)',
                      color: received === amt ? 'var(--primary-foreground)' : 'var(--foreground)',
                      borderColor: received === amt ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    ฿{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={handleConfirm}
                disabled={submitting || received === null || change === null || change < 0}
                className="w-full py-3.5 rounded-xl text-sm font-semibold"
                style={{
                  background:
                    !submitting && received !== null && change !== null && change >= 0
                      ? 'var(--primary)'
                      : 'var(--muted)',
                  color:
                    !submitting && received !== null && change !== null && change >= 0
                      ? 'var(--primary-foreground)'
                      : 'var(--muted-foreground)',
                  cursor:
                    !submitting && received !== null && change !== null && change >= 0
                      ? 'pointer'
                      : 'not-allowed',
                }}
              >
                {submitting ? 'Processing…' : 'Confirm — open drawer'}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-2.5 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <p className="font-bold text-xl mb-4" style={{ color: 'var(--foreground)' }}>Card payment</p>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Amount to charge</p>
              <p className="font-bold text-4xl" style={{ color: 'var(--foreground)' }}>฿{total}</p>
              <p className="text-xs mt-4 p-3 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                Present the card reader to the customer, then tap Confirm once payment is processed.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-sm font-semibold"
                style={{
                  background: submitting ? 'var(--muted)' : 'var(--primary)',
                  color: submitting ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Processing…' : 'Confirm'}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-2.5 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
