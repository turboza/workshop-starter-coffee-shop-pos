'use client'

import { Category } from '@/src/types'

const CATEGORIES: Category[] = ['Coffee', 'Tea', 'Pastry', 'Cold drinks', 'Specials']

interface CategoryTabsProps {
  active: Category
  search: string
  onCategoryChange: (c: Category) => void
  onSearchChange: (s: string) => void
}

export function CategoryTabs({ active, search, onCategoryChange, onSearchChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
            style={{
              background: active === cat ? 'var(--primary)' : 'var(--card)',
              color: active === cat ? 'var(--primary-foreground)' : 'var(--foreground)',
              border: `1px solid ${active === cat ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="px-3 py-2 rounded-lg text-sm outline-none w-32 sm:w-44"
        style={{
          background: 'var(--card)',
          border: `1px solid var(--border)`,
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}
