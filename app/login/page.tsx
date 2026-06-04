'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

type Mode = 'signin' | 'signup'

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: 'var(--border)' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#DC2626' }
  if (score <= 2) return { score, label: 'Fair', color: '#D97706' }
  if (score <= 3) return { score, label: 'Good', color: '#2563EB' }
  return { score, label: 'Strong', color: '#16A34A' }
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const strength = passwordStrength(password)
  const confirmMismatch = mode === 'signup' && confirm.length > 0 && confirm !== password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setSuccess(null)
    setLoading(true)

    const supabase = createSupabaseBrowserClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() || email.split('@')[0] } },
      })
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

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
    setName('')
    setPassword('')
    setConfirm('')
    setShowPassword(false)
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text)',
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
          <h1 className="text-3xl font-display mb-1" style={{ color: 'var(--text)' }}>
            Lina&apos;s Coffee
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Point of Sale
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-subtle)' }}>
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
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

          {/* Name — sign up only */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aey"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Email */}
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
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--text-faint)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Password strength bar — sign up only */}
            {mode === 'signup' && password.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{
                        background: strength.score >= seg ? strength.color : 'var(--border-light)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium w-12 text-right" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password — sign up only */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  ...inputStyle,
                  borderColor: confirmMismatch ? '#DC2626' : 'var(--border)',
                }}
              />
              {confirmMismatch && (
                <p className="text-xs" style={{ color: '#DC2626' }}>
                  Passwords don&apos;t match
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm rounded-xl px-3 py-2.5" style={{ background: '#FEF2F2', color: 'var(--destructive)' }}>
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
            disabled={loading || confirmMismatch}
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
