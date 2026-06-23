'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/src/types'
import { ProductPlaceholder } from '@/src/components/ui/ProductPlaceholder'

function ProductPhoto({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)

  if (!product.image || failed) {
    return <ProductPlaceholder name={product.name} className="w-full aspect-[4/3]" />
  }

  return (
    <div className="relative w-full aspect-[4/3]">
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

interface ProductGridProps {
  products: Product[]
  onSelect: (product: Product) => void
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: 'var(--muted-foreground)' }}>
        <p className="text-sm">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => !product.soldOut && onSelect(product)}
          disabled={product.soldOut}
          className="relative flex flex-col rounded-xl overflow-hidden text-left group"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            opacity: product.soldOut ? 0.6 : 1,
            cursor: product.soldOut ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Photo area */}
          <div className="relative">
            <ProductPhoto product={product} />
            {product.soldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="px-2 py-1 rounded text-xs font-semibold tracking-widest uppercase"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    color: 'var(--muted-foreground)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Sold out
                </span>
              </div>
            )}
            {!product.soldOut && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'oklch(0.6716 0.1368 48.513 / 0.08)' }}
              />
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: product.soldOut ? 'var(--muted-foreground)' : 'var(--foreground)' }}
            >
              {product.name}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              ฿{product.price}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
