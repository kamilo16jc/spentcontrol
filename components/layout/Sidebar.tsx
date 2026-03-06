'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, CalendarDays,
  Target, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useT } from '@/context/LanguageContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { t } = useT()

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/transactions', label: t.nav.transactions, icon: ArrowLeftRight },
    { href: '/budget', label: t.nav.budget, icon: Wallet },
    { href: '/calendar', label: t.nav.calendar, icon: CalendarDays },
    { href: '/savings', label: t.nav.savings, icon: Target },
    { href: '/reports', label: t.nav.reports, icon: BarChart3 },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col z-10" style={{ background: 'white', borderRight: '1px solid #ede9e3' }}>
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #ede9e3' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
            Spent<span style={{ color: '#ff6b35' }}>Control</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200')}
              style={isActive ? { background: '#fff5f0', color: '#ff6b35' } : { color: '#555' }}
            >
              <Icon className="w-5 h-5" style={{ color: isActive ? '#ff6b35' : '#aaa' }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 space-y-1" style={{ borderTop: '1px solid #ede9e3' }}>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ color: '#555' }}>
          <Settings className="w-5 h-5" style={{ color: '#aaa' }} />
          {t.nav.settings}
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ color: '#f56565' }}>
          <LogOut className="w-5 h-5" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}
