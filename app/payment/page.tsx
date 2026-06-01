'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/src/context/CartContext'
import { supabase } from '@/src/lib/supabase'

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

    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        cashier,
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
    <div className="flex flex-col md:flex-row h-screen" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="flex flex-col flex-1 p-6 md:p-10 gap-6">
        {/* Order summary header */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            PAYMENT · ORDER #{orderNumber}
          </p>
          <p className="font-display font-bold" style={{ fontSize: '4rem', lineHeight: 1, color: 'var(--text)' }}>
            ฿{total}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {items.reduce((s, i) => s + i.quantity, 0)} items · {cashier}
          </p>
        </div>

        {/* Items summary */}
        <div
          className="rounded-xl p-4 space-y-1.5"
          style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text)' }}>
                {item.quantity}× {item.product.name}
                {item.options.milk && item.options.milk !== 'Whole' && (
                  <span style={{ color: 'var(--text-muted)' }}> · {item.options.milk}</span>
                )}
              </span>
              <span style={{ color: 'var(--text)' }}>฿{item.unitPrice * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Payment method</p>
          <div className="flex gap-3">
            {(['cash', 'card'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className="flex-1 py-5 rounded-xl border-2 text-center"
                style={{
                  background: method === m ? 'var(--text)' : 'var(--card)',
                  borderColor: method === m ? 'var(--text)' : 'var(--border)',
                  color: method === m ? '#fff' : 'var(--text)',
                }}
              >
                <p className="font-display font-bold text-2xl capitalize">{m === 'cash' ? 'Cash' : 'Card'}</p>
                <p className="text-xs mt-1" style={{ color: method === m ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                  {m === 'cash' ? 'THB' : 'visa · master'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Customer phone (optional) */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Customer (optional)</p>
          <input
            type="tel"
            placeholder="phone number for loyalty…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--card)',
              border: `1.5px dashed var(--border)`,
              color: 'var(--text)',
            }}
          />
          <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>
            ↑ skips silently if left blank
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="flex flex-col w-full md:w-80 lg:w-96 p-6 gap-4 shrink-0"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border-light)' }}
      >
        {method === 'cash' ? (
          <>
            <div>
              <p className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text)' }}>Cash drawer</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Owed</span>
                  <span style={{ color: 'var(--text)' }}>฿{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Received</span>
                  <span style={{ color: 'var(--text)' }}>{received !== null ? `฿${received}` : '—'}</span>
                </div>
                <hr style={{ borderColor: 'var(--border-light)' }} />
                <div className="flex justify-between text-sm font-semibold">
                  <span style={{ color: 'var(--text-muted)' }}>Change</span>
                  <span style={{ color: change !== null && change >= 0 ? 'var(--accent)' : 'var(--destructive)' }}>
                    {change !== null ? `฿${change}` : '฿—'}
                  </span>
                </div>
              </div>

              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Quick cash</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickOptions.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setReceived(amt)}
                    className="py-2.5 rounded-xl text-sm font-semibold border"
                    style={{
                      background: received === amt ? 'var(--text)' : 'var(--bg)',
                      color: received === amt ? '#fff' : 'var(--text)',
                      borderColor: received === amt ? 'var(--text)' : 'var(--border)',
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
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  background:
                    !submitting && received !== null && change !== null && change >= 0
                      ? 'var(--accent)'
                      : 'var(--border)',
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
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <p className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text)' }}>Card payment</p>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Amount to charge</p>
              <p className="font-display font-bold text-4xl" style={{ color: 'var(--text)' }}>฿{total}</p>
              <p className="text-xs mt-4 p-3 rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}>
                Present the card reader to the customer, then tap Confirm once payment is processed.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: submitting ? 'var(--border)' : 'var(--accent)', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Processing…' : 'Confirm'}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-2.5 text-sm"
                style={{ color: 'var(--text-muted)' }}
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
