import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from './Icon'

const appUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function switchMode(next: 'signin' | 'signup' | 'forgot') {
    setMode(next)
    setPassword('')
    setError('')
    setMessage('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return

    setBusy(true)
    setError('')
    setMessage('')

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: appUrl(),
      })
      setBusy(false)
      if (error) setError(error.message)
      else setMessage('Password reset email sent. Open the link in that email to choose a new password.')
      return
    }

    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: appUrl() },
        })

    setBusy(false)
    if (result.error) setError(result.error.message)
    else if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm the address, then sign in.')
    }
  }

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create your account' : 'Reset your password'
  const button = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset email'

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'forgot' ? 'Enter your account email and Ledger will send a secure recovery link.' : 'Your records are isolated with database row-level security.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="field-label">
          Email
          <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </label>

        {mode !== 'forgot' && (
          <label className="field-label">
            Password
            <input className="field mt-1.5" type="password" minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </label>
        )}

        {mode === 'signin' && (
          <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-950" onClick={() => switchMode('forgot')}>
            Forgot password?
          </button>
        )}

        {error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        {message && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}

        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Working…' : button}</button>
      </form>

      {mode === 'signin' && (
        <button className="mt-5 w-full text-center text-sm font-medium text-slate-600 hover:text-slate-950" onClick={() => switchMode('signup')}>
          Need an account? Create one
        </button>
      )}
      {mode === 'signup' && (
        <button className="mt-5 w-full text-center text-sm font-medium text-slate-600 hover:text-slate-950" onClick={() => switchMode('signin')}>
          Already have an account? Sign in
        </button>
      )}
      {mode === 'forgot' && (
        <button className="mt-5 w-full text-center text-sm font-medium text-slate-600 hover:text-slate-950" onClick={() => switchMode('signin')}>
          Back to sign in
        </button>
      )}
    </AuthLayout>
  )
}

export function ResetPasswordScreen({ onComplete }: { onComplete: () => Promise<void> | void }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setBusy(false)
      setError(error.message)
      return
    }

    window.history.replaceState({}, document.title, appUrl())
    await supabase.auth.signOut()
    setBusy(false)
    await onComplete()
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-500">Set a new password for your Ledger account.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="field-label">
          New password
          <input className="field mt-1.5" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        </label>
        <label className="field-label">
          Confirm new password
          <input className="field mt-1.5" type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
        </label>

        {error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-950 px-5 py-10 text-white sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950"><Icon name="wallet"/></div>
          <div><div className="text-xl font-semibold tracking-tight">Ledger</div><div className="text-sm text-slate-400">Private personal finance</div></div>
        </div>
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          {children}
        </div>
        <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><Icon name="shield" size={16} className="mt-0.5 shrink-0"/><span>The frontend contains only the Supabase publishable key. Never place a service-role key in this app.</span></div>
      </div>
    </main>
  )
}
