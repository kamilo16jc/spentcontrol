'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 60%, #ffb347 100%)' }}>
        <div className="card w-full max-w-md mx-4 text-center">
          <span style={{ fontSize: '48px' }}>📧</span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', margin: '16px 0 8px' }}>Revisa tu correo</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
            Te enviamos un link de confirmacion a <strong>{email}</strong>. Haz click en el link para activar tu cuenta.
          </p>
          <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            Ir al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 60%, #ffb347 100%)' }}>
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <span style={{ fontSize: '56px' }}>💰</span>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '8px 0 4px' }}>
            Spent<span style={{ color: '#1a1a2e' }}>Control</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>Tu dinero, bajo control</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '6px' }}>Crear cuenta</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Empieza a controlar tus finanzas</p>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '10px 14px', color: '#c53030', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Juan Perez" />
            </div>
            <div>
              <label className="label">Correo electronico</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tu@correo.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Minimo 6 caracteres" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#ff6b35', fontWeight: 700 }}>Inicia sesion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
