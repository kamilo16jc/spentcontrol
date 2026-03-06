'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT } from '@/context/LanguageContext'

export default function Header({ title }: { title: string }) {
  const today = formatDate(new Date())
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { lang, setLang, t } = useT()
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url || '',
        })
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <header className="px-6 py-4 flex items-center justify-between" style={{ background: 'white', borderBottom: '1px solid #ede9e3' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#aaa' }}>{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#aaa' }} />
          <input
            type="text"
            placeholder={t.header.search}
            style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', background: '#f7f3ee', border: '1.5px solid #ede9e3', borderRadius: '12px', outline: 'none', width: '220px', color: '#1a1a2e' }}
          />
        </div>

        {/* Language toggle */}
        <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #ede9e3' }}>
          {(['es', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 700,
                background: lang === l ? '#ff6b35' : '#f7f3ee',
                color: lang === l ? 'white' : '#aaa',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <button style={{ position: 'relative', padding: '8px', borderRadius: '10px', background: '#f7f3ee', border: 'none', cursor: 'pointer', color: '#555' }}>
          <Bell style={{ width: '18px', height: '18px' }} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ff6b35', borderRadius: '50%', border: '2px solid white' }} />
        </button>

        {/* Profile dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '12px', background: '#f7f3ee', border: '1.5px solid #ede9e3', cursor: 'pointer' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #ffb347)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.2 }}>{user?.name || 'Usuario'}</p>
              <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{user?.email || ''}</p>
            </div>
            <ChevronDown style={{ width: '14px', height: '14px', color: '#aaa', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #ede9e3', minWidth: '180px', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #ede9e3' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{user?.email}</p>
              </div>
              <div style={{ padding: '6px' }}>
                <Link href="/settings" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#555', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f7f3ee')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings style={{ width: '15px', height: '15px', color: '#aaa' }} />
                  {t.nav.settings}
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#f56565', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut style={{ width: '15px', height: '15px' }} />
                  {t.nav.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
