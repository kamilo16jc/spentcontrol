'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 60%, #ffb347 100%)' }}>
      {/* Decoration circles */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <span style={{ fontSize: '56px' }}>💰</span>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '8px 0 4px' }}>
            Spent<span style={{ color: '#1a1a2e' }}>Control</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>Tu dinero, bajo control</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '6px' }}>Iniciar sesion</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Bienvenido de vuelta</p>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '10px 14px', color: '#c53030', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Correo electronico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: '#ff6b35', fontWeight: 700 }}>Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
