'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

export function AnimatedThemeToggler() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-7" aria-hidden />

  const isDark = resolvedTheme === 'dark'

  function toggle() {
    const next = isDark ? 'light' : 'dark'

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => setTheme(next))
    } else {
      setTheme(next)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="size-7 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-accent"
      style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
    >
      {isDark ? (
        <SunIcon className="size-3.5" />
      ) : (
        <MoonIcon className="size-3.5" />
      )}
    </button>
  )
}
