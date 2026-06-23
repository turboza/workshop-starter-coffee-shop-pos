'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Ingredient, StockAdjustment } from '@/src/types'
import { getStockStatus } from '@/src/lib/stockStatus'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'low' | 'approaching'

// ─── Summary chips ───────────────────────────────────────────────────────────

function SummaryChips({ ingredients }: { ingredients: Ingredient[] }) {
  const below = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'below').length
  const approaching = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'approaching').length
  const ok = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'ok').length

  return (
    <div className="flex items-center gap-2">
      <span
        className="px-3 py-1 rounded text-xs font-bold tracking-wide uppercase"
        style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
      >
        {below} below par
      </span>
      <span
        className="px-3 py-1 rounded text-xs font-bold tracking-wide uppercase"
        style={{ background: '#b45309', color: '#fff' }}
      >
        {approaching} approaching
      </span>
      <span
        className="px-3 py-1 rounded text-xs font-bold tracking-wide uppercase"
        style={{ background: '#15803d', color: '#fff' }}
      >
        {ok} healthy
      </span>
    </div>
  )
}

// ─── On-hand vs par bar ──────────────────────────────────────────────────────

function StockBar({ count, par }: { count: number; par: number }) {
  const status = getStockStatus(count, par)
  const max = Math.max(count, par) * 1.1
  const countPct = Math.min((count / max) * 100, 100)
  const parPct = Math.min((par / max) * 100, 100)

  const fillColor =
    status === 'below' ? 'var(--destructive)' :
    status === 'approaching' ? '#b45309' :
    '#15803d'

  return (
    <div className="relative flex-1 h-3 rounded-full overflow-visible" style={{ background: 'var(--muted)' }}>
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${countPct}%`, background: fillColor }}
      />
      {/* par tick */}
      <div
        className="absolute top-0 h-full w-0.5"
        style={{ left: `${parPct}%`, background: 'var(--foreground)', opacity: 0.4 }}
      />
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ count, par }: { count: number; par: number }) {
  const status = getStockStatus(count, par)

  if (status === 'below') {
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
        style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
      >
        BELOW PAR
      </span>
    )
  }
  if (status === 'approaching') {
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
        style={{ background: '#b45309', color: '#fff' }}
      >
        SOON
      </span>
    )
  }
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
      style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
    >
      OK
    </span>
  )
}

// ─── Inline count stepper ─────────────────────────────────────────────────────

interface StepperProps {
  ingredient: Ingredient
  onCommit: (ingredientId: string, newCount: number) => Promise<void>
  onCancel: () => void
}

function CountStepper({ ingredient, onCommit, onCancel }: StepperProps) {
  const [value, setValue] = useState(ingredient.count)
  const [saving, setSaving] = useState(false)

  const step = ingredient.unit === 'kg' || ingredient.unit === 'L' ? 0.1 : 1

  async function handleCommit() {
    setSaving(true)
    await onCommit(ingredient.id, value)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setValue((v) => Math.max(0, parseFloat((v - step).toFixed(2))))}
        className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
        style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        disabled={saving}
      >
        −
      </button>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); if (e.key === 'Escape') onCancel() }}
        className="w-20 text-center text-sm font-semibold rounded px-1 py-0.5 outline-none"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--primary)',
          color: 'var(--foreground)',
        }}
        autoFocus
        disabled={saving}
      />
      <button
        onClick={() => setValue((v) => parseFloat((v + step).toFixed(2)))}
        className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
        style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        disabled={saving}
      >
        +
      </button>
      <button
        onClick={handleCommit}
        className="ml-1 px-2 py-0.5 rounded text-xs font-semibold"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        disabled={saving}
      >
        {saving ? '…' : '✓'}
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-0.5 rounded text-xs"
        style={{ color: 'var(--muted-foreground)' }}
        disabled={saving}
      >
        ✕
      </button>
    </div>
  )
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({
  adjustments,
  ingredients,
  filterIngredientId,
  onClose,
}: {
  adjustments: StockAdjustment[]
  ingredients: Ingredient[]
  filterIngredientId: string | null
  onClose: () => void
}) {
  const nameMap = new Map(ingredients.map((i) => [i.id, i.name]))

  const filtered = filterIngredientId
    ? adjustments.filter((a) => a.ingredientId === filterIngredientId)
    : adjustments

  function fmtDelta(delta: number) {
    return delta >= 0 ? `+${delta}` : `${delta}`
  }

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(iso).toLocaleDateString()
  }

  return (
    <div
      className="fixed inset-y-0 right-0 w-80 flex flex-col z-50 shadow-2xl"
      style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
          {filterIngredientId ? nameMap.get(filterIngredientId) : 'All changes'}
        </h2>
        <button
          onClick={onClose}
          className="text-lg leading-none"
          style={{ color: 'var(--muted-foreground)' }}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
            No changes yet
          </p>
        )}
        {filtered.map((adj) => (
          <div
            key={adj.id}
            className="rounded-lg p-3 space-y-1"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {!filterIngredientId && (
              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {nameMap.get(adj.ingredientId) ?? adj.ingredientId}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                {adj.previous} → {adj.next}
              </span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: adj.delta >= 0 ? '#15803d20' : '#99111120',
                  color: adj.delta >= 0 ? '#15803d' : 'var(--destructive)',
                }}
              >
                {fmtDelta(adj.delta)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {adj.cashier} · {adj.reason}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {relativeTime(adj.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stocktake modal ──────────────────────────────────────────────────────────

interface StocktakeModalProps {
  ingredients: Ingredient[]
  onClose: () => void
  onConfirm: (changes: { id: string; newCount: number }[]) => Promise<void>
}

function StocktakeModal({ ingredients, onClose, onConfirm }: StocktakeModalProps) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(ingredients.map((i) => [i.id, i.count]))
  )
  const [phase, setPhase] = useState<'edit' | 'confirm' | 'saving'>('edit')

  const changes = ingredients.filter((i) => counts[i.id] !== i.count)

  async function handleSave() {
    setPhase('saving')
    await onConfirm(changes.map((i) => ({ id: i.id, newCount: counts[i.id] })))
  }

  const step = (unit: string) => unit === 'kg' || unit === 'L' ? 0.1 : 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-lg mx-4 rounded-2xl flex flex-col max-h-[85vh]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>New stock count</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Enter the actual counts — only changed rows will be saved
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}>✕</button>
        </div>

        {phase === 'confirm' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {changes.length === 0 ? 'No changes to save.' : `${changes.length} ingredient${changes.length !== 1 ? 's' : ''} will be updated:`}
            </p>
            {changes.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--foreground)' }}>{ing.name}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {ing.count} → <strong style={{ color: 'var(--foreground)' }}>{counts[ing.id]}</strong> {ing.unit}
                </span>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setPhase('edit')}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={changes.length === 0}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: changes.length === 0 ? 'var(--muted)' : 'var(--primary)',
                  color: changes.length === 0 ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                }}
              >
                Save {changes.length} change{changes.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        ) : phase === 'saving' ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Saving…</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="px-5 py-2 text-left text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>Ingredient</th>
                    <th className="px-5 py-2 text-left text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>Unit</th>
                    <th className="px-5 py-2 text-right text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr key={ing.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{ing.name}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{ing.unit}</td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          step={step(ing.unit)}
                          value={counts[ing.id]}
                          onChange={(e) =>
                            setCounts((prev) => ({ ...prev, [ing.id]: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-24 text-right text-sm font-semibold rounded px-2 py-1 outline-none"
                          style={{
                            background: counts[ing.id] !== ing.count ? 'var(--background)' : 'transparent',
                            border: counts[ing.id] !== ing.count ? '1px solid var(--primary)' : '1px solid transparent',
                            color: 'var(--foreground)',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setPhase('confirm')}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Review changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  return <>{time}</>
}

// ─── Main InventoryView ───────────────────────────────────────────────────────

interface InventoryViewProps {
  ingredients: Ingredient[]
  adjustments: StockAdjustment[]
}

export function InventoryView({ ingredients: initialIngredients, adjustments: initialAdjustments }: InventoryViewProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [adjustments] = useState(initialAdjustments)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyIngredientId, setHistoryIngredientId] = useState<string | null>(null)
  const [stocktakeOpen, setStocktakeOpen] = useState(false)

  const belowCount = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'below').length
  const approachingCount = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'approaching').length

  const filtered = ingredients.filter((ing) => {
    const status = getStockStatus(ing.count, ing.par)
    if (filter === 'low' && status !== 'below') return false
    if (filter === 'approaching' && status !== 'approaching') return false
    if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const lastStocktake = adjustments.filter((a) => a.reason === 'stocktake').sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]

  function fmtLastStocktake() {
    if (!lastStocktake) return '—'
    const d = new Date(lastStocktake.timestamp)
    return `${d.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · by ${lastStocktake.cashier}`
  }

  async function handleAdjust(ingredientId: string, newCount: number) {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cashier = user?.user_metadata?.name ?? user?.email ?? 'unknown'

    const ing = ingredients.find((i) => i.id === ingredientId)!
    const previousH = Math.round(ing.count * 100)
    const newH = Math.round(newCount * 100)
    const deltaH = newH - previousH

    await supabase.from('ingredients').update({ count_h: newH }).eq('id', ingredientId)
    await supabase.from('stock_adjustments').insert({
      ingredient_id: ingredientId,
      previous_h: previousH,
      new_h: newH,
      delta_h: deltaH,
      reason: 'adjust',
      cashier,
    })

    // Optimistically update local state
    setIngredients((prev) =>
      prev.map((i) => i.id === ingredientId ? { ...i, count: newCount } : i)
    )
    setEditingId(null)
    router.refresh()
  }

  async function handleStocktake(changes: { id: string; newCount: number }[]) {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cashier = user?.user_metadata?.name ?? user?.email ?? 'unknown'

    for (const { id, newCount } of changes) {
      const ing = ingredients.find((i) => i.id === id)!
      const previousH = Math.round(ing.count * 100)
      const newH = Math.round(newCount * 100)
      const deltaH = newH - previousH
      await supabase.from('ingredients').update({ count_h: newH }).eq('id', id)
      await supabase.from('stock_adjustments').insert({
        ingredient_id: id,
        previous_h: previousH,
        new_h: newH,
        delta_h: deltaH,
        reason: 'stocktake',
        cashier,
      })
    }

    setStocktakeOpen(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col relative">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Stock · today <LiveClock />
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {ingredients.length} ingredients tracked · one location
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SummaryChips ingredients={ingredients} />
          <button
            onClick={() => setHistoryOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            History
          </button>
          <button
            onClick={() => setStocktakeOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            New stock count
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'low', label: `Low stock · ${belowCount}` },
          { key: 'approaching', label: `Approaching · ${approachingCount}` },
        ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: filter === key ? 'var(--primary)' : 'var(--card)',
              color: filter === key ? 'var(--primary-foreground)' : 'var(--foreground)',
              border: `1px solid ${filter === key ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <input
          type="text"
          placeholder="search ingredient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none w-44"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['INGREDIENT', 'UNIT', 'ON-HAND VS PAR', 'COUNT', 'PAR', 'STATUS'].map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase ${col === 'COUNT' || col === 'PAR' ? 'text-right' : ''}`}
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => {
                const status = getStockStatus(ing.count, ing.par)
                const isBelowPar = status === 'below'

                return (
                  <tr
                    key={ing.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isBelowPar ? 'color-mix(in srgb, var(--destructive) 6%, transparent)' : 'transparent',
                    }}
                  >
                    {/* Ingredient name — click to open history */}
                    <td
                      className="px-4 py-3 font-medium cursor-pointer hover:underline"
                      style={{ color: 'var(--foreground)', minWidth: 180 }}
                      onClick={() => {
                        setHistoryIngredientId(ing.id)
                        setHistoryOpen(true)
                      }}
                    >
                      {ing.name}
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                      {ing.unit}
                    </td>

                    {/* Bar */}
                    <td className="px-4 py-3" style={{ minWidth: 160 }}>
                      <StockBar count={ing.count} par={ing.par} />
                    </td>

                    {/* Count — tap to edit */}
                    <td className="px-4 py-3 text-right" style={{ minWidth: 160 }}>
                      {editingId === ing.id ? (
                        <CountStepper
                          ingredient={ing}
                          onCommit={handleAdjust}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(ing.id)}
                          className="font-semibold rounded px-2 py-0.5 hover:ring-1 transition-all"
                          style={{
                            color: 'var(--foreground)',
                            background: 'var(--background)',
                          }}
                        >
                          {ing.count}
                        </button>
                      )}
                    </td>

                    {/* Par */}
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--muted-foreground)' }}>
                      {ing.par}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge count={ing.count} par={ing.par} />
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No ingredients match
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 flex-wrap gap-2">
        <p className="text-xs font-display italic" style={{ color: 'var(--muted-foreground)' }}>
          Tap any count to adjust — every change is logged with who &amp; when.
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Last full stocktake: {fmtLastStocktake()}
        </p>
      </div>

      {/* History slide-over */}
      {historyOpen && (
        <HistoryPanel
          adjustments={adjustments}
          ingredients={ingredients}
          filterIngredientId={historyIngredientId}
          onClose={() => { setHistoryOpen(false); setHistoryIngredientId(null) }}
        />
      )}

      {/* Stocktake modal */}
      {stocktakeOpen && (
        <StocktakeModal
          ingredients={ingredients}
          onClose={() => setStocktakeOpen(false)}
          onConfirm={handleStocktake}
        />
      )}
    </div>
  )
}
