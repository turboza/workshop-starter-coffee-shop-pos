'use client'

import { useState } from 'react'
import { Product, SizeOption, MilkOption, ExtraOption, CartItem } from '@/src/types'
import { sizeUpcharge, milkUpcharge, extraUpcharge } from '@/src/data/products'
import { useCart } from '@/src/context/CartContext'

const SIZES: SizeOption[] = ['S 12oz', 'M 16oz', 'L 20oz']
const MILKS: MilkOption[] = ['Whole', 'Skim', 'Oat', 'Soy', 'Almond']
const EXTRAS: ExtraOption[] = ['Extra shot', 'Decaf', 'Less sugar', 'No foam']

interface CustomizeModalProps {
  product: Product
  onClose: () => void
}

export function CustomizeModal({ product, onClose }: CustomizeModalProps) {
  const { addItem, orderNumber } = useCart()
  const [size, setSize] = useState<SizeOption>('S 12oz')
  const [milk, setMilk] = useState<MilkOption>('Whole')
  const [extras, setExtras] = useState<ExtraOption[]>([])
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(1)

  const unitPrice =
    product.price +
    sizeUpcharge[size] +
    milkUpcharge[milk] +
    extras.reduce((sum, e) => sum + extraUpcharge[e], 0)

  function toggleExtra(extra: ExtraOption) {
    setExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    )
  }

  function handleAdd() {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      options: { size, milk, extras, note },
      quantity,
      unitPrice,
    }
    addItem(item)
    onClose()
  }

  const summaryParts: string[] = []
  if (size !== 'S 12oz') summaryParts.push(size.split(' ')[0])
  if (milk !== 'Whole') summaryParts.push(milk)
  extras.forEach((e) => summaryParts.push(e))

  function PillButton({
    label,
    active,
    upcharge,
    onClick,
  }: {
    label: string
    active: boolean
    upcharge?: number
    onClick: () => void
  }) {
    return (
      <button
        onClick={onClick}
        className="px-3 py-1.5 rounded-full text-sm font-medium border"
        style={{
          background: active ? 'var(--text)' : 'var(--card)',
          color: active ? '#fff' : 'var(--text)',
          borderColor: active ? 'var(--text)' : 'var(--border)',
        }}
      >
        {label}
        {upcharge ? ` +฿${upcharge}` : ''}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {product.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Base ฿{product.price}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none p-1"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Cup size */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Cup size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <PillButton
                  key={s}
                  label={s}
                  active={size === s}
                  upcharge={sizeUpcharge[s] || undefined}
                  onClick={() => setSize(s)}
                />
              ))}
            </div>
          </div>

          {/* Milk */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Milk</p>
            <div className="flex flex-wrap gap-2">
              {MILKS.map((m) => (
                <PillButton
                  key={m}
                  label={m}
                  active={milk === m}
                  upcharge={milkUpcharge[m] || undefined}
                  onClick={() => setMilk(m)}
                />
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Extras</p>
            <div className="flex flex-wrap gap-2">
              {EXTRAS.map((e) => (
                <PillButton
                  key={e}
                  label={e}
                  active={extras.includes(e)}
                  upcharge={extraUpcharge[e] || undefined}
                  onClick={() => toggleExtra(e)}
                />
              ))}
            </div>
          </div>

          {/* Barista note */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Note for barista</p>
            <input
              type="text"
              placeholder='e.g. "extra hot"'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--card)',
                border: `1.5px dashed var(--border)`,
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Separator */}
          <hr style={{ borderColor: 'var(--border-light)' }} />

          {/* Summary + actions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {summaryParts.length > 0 && (
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  {summaryParts.join(' · ')}
                </p>
              )}
              <p className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
                ฿{unitPrice * quantity}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quantity stepper */}
              <div className="flex items-center gap-2 rounded-xl border px-2 py-1" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg text-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}
                >
                  −
                </button>
                <span className="text-sm font-semibold w-5 text-center" style={{ color: 'var(--text)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg text-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}
                >
                  +
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Add to order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
