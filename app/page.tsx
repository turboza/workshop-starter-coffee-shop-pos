'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Category, Product } from '@/src/types'
import { products } from '@/src/data/products'
import { CategoryTabs } from '@/src/components/till/CategoryTabs'
import { ProductGrid } from '@/src/components/till/ProductGrid'
import { CartPanel } from '@/src/components/till/CartPanel'
import { CustomizeModal } from '@/src/components/till/CustomizeModal'
import { useCart } from '@/src/context/CartContext'

export default function TillPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Coffee')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { items, total } = useCart()

  const filtered = products.filter((p) => {
    if (search) {
      return p.name.toLowerCase().includes(search.toLowerCase())
    }
    return p.category === activeCategory
  })

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 py-2 text-xs shrink-0"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-light)' }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · Lina&apos;s POS
        </span>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--text-muted)' }}>TABLET · iPad</span>
          <Link
            href="/dashboard"
            className="px-3 py-1 rounded-lg text-xs font-medium"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Product area */}
        <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
          <CategoryTabs
            active={activeCategory}
            search={search}
            onCategoryChange={(c) => { setActiveCategory(c); setSearch('') }}
            onSearchChange={setSearch}
          />
          <div className="flex-1 overflow-y-auto">
            <ProductGrid products={filtered} onSelect={setSelectedProduct} />
          </div>
        </div>

        {/* Cart sidebar — desktop */}
        <div
          className="hidden md:flex flex-col w-72 lg:w-80 p-3 shrink-0"
          style={{ borderLeft: '1px solid var(--border-light)' }}
        >
          <CartPanel />
        </div>
      </div>

      {/* Mobile cart bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border-light)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
          {items.length > 0 && (
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>฿{total}</p>
          )}
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: items.length > 0 ? 'var(--accent)' : 'var(--border)' }}
        >
          {items.length > 0 ? 'View cart' : 'Empty'}
        </button>
      </div>

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col justify-end"
          style={{ background: 'rgba(15,23,42,0.4)' }}
          onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}
        >
          <div
            className="rounded-t-2xl p-4"
            style={{ background: 'var(--bg)', height: '80vh' }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold" style={{ color: 'var(--text)' }}>Your order</span>
              <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <CartPanel />
          </div>
        </div>
      )}

      {/* Customize modal */}
      {selectedProduct && (
        <CustomizeModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
