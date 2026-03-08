import { useState } from 'react'
import type { FormEvent } from 'react'

const STORAGE_KEY = 'yOS_unlocked'

export function getIsUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(STORAGE_KEY) === '1'
}

export function setUnlocked(): void {
  sessionStorage.setItem(STORAGE_KEY, '1')
}

type Props = {
  onUnlock: () => void
}

const expectedPassword = import.meta.env.VITE_APP_PASSWORD ?? ''

export function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!expectedPassword) {
      setError('Password not configured. Set VITE_APP_PASSWORD in .env.local')
      return
    }
    if (password === expectedPassword) {
      setUnlocked()
      onUnlock()
      window.location.reload()
    } else {
      setError('Wrong password')
      setPassword('')
    }
  }

  const gateBg = 'var(--orb-bg, #f1f5f9)'
  const cardBg = 'var(--orb-bg-elevated, #ffffff)'
  const textColor = 'var(--orb-text, #0f172a)'
  const mutedColor = 'var(--orb-text-muted, #64748b)'
  const borderColor = 'var(--orb-border, #e2e8f0)'
  const accentBg = 'var(--orb-accent, #037a68)'
  const accentText = 'var(--orb-accent-contrast, #ffffff)'

  if (!expectedPassword) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: gateBg, minHeight: '100dvh' }}
      >
        <div className="w-full max-w-sm rounded-2xl border p-6 text-center shadow-lg" style={{ background: cardBg, borderColor }}>
          <h1 className="text-xl font-bold" style={{ color: textColor }}>yOS</h1>
          <p className="mt-3 text-sm" style={{ color: mutedColor }}>
            Set <code className="rounded px-1 py-0.5 text-xs" style={{ background: 'var(--orb-bg-muted,#e2e8f0)' }}>VITE_APP_PASSWORD</code> in
            .env.local (and in your deploy host&apos;s env) to enable the lock.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: gateBg, minHeight: '100dvh' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-6 shadow-lg"
        style={{ background: cardBg, borderColor }}
      >
        <h1 className="text-center text-xl font-bold" style={{ color: textColor }}>
          yOS
        </h1>
        <p className="mt-1 text-center text-xs" style={{ color: mutedColor }}>
          Enter password to continue
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="orb-input mt-4 h-11 w-full rounded-xl border px-3 outline-none focus:ring-2"
          style={{
            borderColor,
            background: cardBg,
            color: textColor,
          }}
        />
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: accentBg, color: accentText }}
        >
          Unlock
        </button>
      </form>
    </div>
  )
}
