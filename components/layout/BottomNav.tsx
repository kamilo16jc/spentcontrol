'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Wallet, CalendarDays, Target, BarChart3 } from 'lucide-react'
import { useT } from '@/context/LanguageContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useT()

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/transactions', label: t.nav.transactions, icon: ArrowLeftRight },
    { href: '/budget', label: t.nav.budget, icon: Wallet },
    { href: '/calendar', label: t.nav.calendar, icon: CalendarDays },
    { href: '/savings', label: t.nav.savings, icon: Target },
    { href: '/reports', label: t.nav.reports, icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden" style={{ background: 'white', borderTop: '1px solid #ede9e3' }}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ color: isActive ? '#ff6b35' : '#aaa' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-semibold truncate w-full text-center px-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
