'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const supabase = createSupabaseBrowserClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created! Check your email to confirm, or sign in now if confirmation is disabled.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Wrong email or password. Please try again.')
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-sm p-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
      >
        {/* Logo / title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-display mb-1"
            style={{ color: 'var(--text)' }}
          >
            Lina&apos;s Coffee
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Point of Sale
          </p>
        </div>

        {/* Mode tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'var(--bg-subtle)' }}
        >
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                mode === m
                  ? { background: 'var(--card)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-3 py-2.5" style={{ background: 'var(--destructive-bg)', color: 'var(--destructive)' }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm rounded-xl px-3 py-2.5" style={{ background: '#F0FDF4', color: 'var(--success)' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {loading
              ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
              : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
