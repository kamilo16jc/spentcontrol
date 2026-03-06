'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react'
import { formatCurrency, getCategoryInfo, formatDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useT } from '@/context/LanguageContext'

export default function DashboardPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [totalSaved, setTotalSaved] = useState(0)
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const CATEGORY_COLORS: Record<string, string> = {
    food: '#F59E0B', transport: '#3B82F6', health: '#EF4444',
    entertainment: '#EC4899', services: '#6366F1', education: '#8B5CF6',
    home: '#14B8A6', other: '#94A3B8',
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const monthStr = String(month).padStart(2, '0')
    const startOfMonth = `${year}-${monthStr}-01`
    const endOfMonth = `${year}-${monthStr}-31`

    // This month transactions
    const { data: txMonth } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false })

    const inc = (txMonth || []).filter((t) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0)
    const exp = (txMonth || []).filter((t) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0)
    setIncome(inc)
    setExpenses(exp)
    setRecentTx((txMonth || []).slice(0, 5))

    // Category breakdown
    const catMap: Record<string, number> = {}
    ;(txMonth || []).filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount
    })
    const catArr = Object.entries(catMap).map(([key, val]) => ({
      name: getCategoryInfo(key).label,
      value: val,
      color: CATEGORY_COLORS[key] || '#94A3B8',
    }))
    setCategoryData(catArr)

    // Saving goals total
    const { data: goals } = await supabase.from('saving_goals').select('saved_amount')
    setTotalSaved((goals || []).reduce((s: number, g: any) => s + g.saved_amount, 0))

    // Upcoming fixed payments (not paid this month)
    const { data: fp } = await supabase.from('fixed_payments').select('*').eq('is_active', true).order('day_of_month')
    const { data: fpStatus } = await supabase.from('fixed_payment_status').select('*').eq('month', month).eq('year', year).eq('is_paid', false)
    const unpaidIds = new Set((fpStatus || []).map((s: any) => s.fixed_payment_id))
    // Show payments not marked paid (or with no status = unpaid)
    const today = now.getDate()
    const upcoming = (fp || [])
      .filter((p: any) => !unpaidIds.has(p.id) || true)
      .filter((p: any) => p.day_of_month >= today)
      .slice(0, 3)
    setUpcomingPayments(upcoming)

    // Last 6 months data
    const months6: any[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const ms = `${y}-${String(m).padStart(2, '0')}-01`
      const me = `${y}-${String(m).padStart(2, '0')}-31`
      const { data: txM } = await supabase.from('transactions').select('amount, type').gte('date', ms).lte('date', me)
      const mInc = (txM || []).filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0)
      const mExp = (txM || []).filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0)
      months6.push({ month: d.toLocaleString('es-ES', { month: 'short' }), ingresos: mInc, gastos: mExp })
    }
    setMonthlyData(months6)
    setLoading(false)
  }

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title={t.dashboard.monthIncome} amount={income} icon={TrendingUp} color="green" />
          <StatCard title={t.dashboard.monthExpenses} amount={expenses} icon={TrendingDown} color="red" />
          <StatCard title={t.dashboard.balance} amount={income - expenses} icon={Wallet} color="blue" />
          <StatCard title={t.dashboard.totalSaved} amount={totalSaved} icon={PiggyBank} color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t.dashboard.incomeVsExpenses}</h2>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">{t.dashboard.loading}</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Area type="monotone" dataKey="ingresos" stroke="#10B981" fill="url(#colorIngresos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="gastos" stroke="#EF4444" fill="url(#colorGastos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t.dashboard.expensesByCategory}</h2>
            {loading || categoryData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
                {loading ? t.dashboard.loading : t.dashboard.noExpenses}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">{t.dashboard.recentTransactions}</h2>
              <Link href="/transactions" className="text-sm font-semibold" style={{ color: '#ff6b35' }}>{t.dashboard.viewAll}</Link>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{t.dashboard.noTransactions}</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((tx) => {
                  const cat = getCategoryInfo(tx.category)
                  const isIncome = tx.type === 'INCOME'
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(new Date(tx.date))}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">{t.dashboard.upcomingPayments}</h2>
              <Link href="/calendar" className="text-sm font-semibold" style={{ color: '#ff6b35' }}>{t.dashboard.viewAllPayments}</Link>
            </div>
            {upcomingPayments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{t.dashboard.noPayments}</p>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((pay) => (
                  <div key={pay.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pay.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{pay.name}</p>
                      <p className="text-xs text-gray-400">{t.dashboard.day} {pay.day_of_month}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(pay.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
