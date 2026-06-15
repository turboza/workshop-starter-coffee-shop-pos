'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function BannerInner() {
  const [show, setShow] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('denied') === 'managers-only') {
      setShow(true)
      const t = setTimeout(() => setShow(false), 4000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
      style={{ background: 'var(--destructive)', color: '#fff' }}
    >
      Managers only — the dashboard is for managers.
    </div>
  )
}

export function DeniedBanner() {
  return (
    <Suspense>
      <BannerInner />
    </Suspense>
  )
}
