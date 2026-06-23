'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'signin' | 'signup'

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: 'var(--border)' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'var(--destructive)' }
  if (score <= 2) return { score, label: 'Fair', color: 'var(--warning)' }
  if (score <= 3) return { score, label: 'Good', color: 'var(--primary)' }
  return { score, label: 'Strong', color: 'var(--success)' }
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
        options: {
          data: { name: name.trim() || email.split('@')[0] },
          emailRedirectTo: `${location.origin}/login`,
        },
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

  const fieldHeight = 'h-11'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Logo / title */}
          <div className="mb-8 text-center">
            <h1 className="mb-1 font-display text-4xl text-foreground">
              Lina&apos;s Coffee
            </h1>
            <p className="text-sm text-muted-foreground">Point of Sale</p>
          </div>

          {/* Mode tabs */}
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
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
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aey"
                  className={fieldHeight}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldHeight}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${fieldHeight} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password strength bar — sign up only */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{
                          background: strength.score >= seg ? strength.color : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="w-12 text-right text-xs font-medium"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password — sign up only */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={confirmMismatch}
                  className={fieldHeight}
                />
                {confirmMismatch && (
                  <p className="text-xs text-destructive">Passwords don&apos;t match</p>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success">
                {success}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading || confirmMismatch}
              className={`w-full ${fieldHeight}`}
            >
              {loading
                ? mode === 'signin'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
        </div>

        {/* Test credentials — for reviewers trying the app */}
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Test logins (password: coffee)
          </p>
          <dl className="space-y-0.5 text-xs text-muted-foreground">
            <div className="flex justify-between gap-2">
              <dt>Manager</dt>
              <dd className="font-mono text-foreground">manager@example.com</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Cashier</dt>
              <dd className="font-mono text-foreground">cashier@example.com</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
