'use client'

import { useLinkStatus } from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function TopLoadingBar() {
  const { pending } = useLinkStatus()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pending) {
      // Delay fade-in by 100ms to avoid flicker on fast navigations
      timerRef.current = setTimeout(() => setVisible(true), 100)
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setVisible(false)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pending])

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 w-full z-50 pointer-events-none"
      style={{ height: '3px' }}
    >
      <div
        className="h-full bg-primary"
        style={{
          opacity: visible ? 1 : 0,
          transition: visible ? 'opacity 0.15s ease' : 'opacity 0.3s ease 0.1s',
          animation: visible ? 'loading-bar-sweep 1.8s ease-in-out infinite' : 'none',
          transformOrigin: 'left center',
        }}
      />
    </div>
  )
}
