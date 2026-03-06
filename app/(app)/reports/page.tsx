'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import { Download, BarChart3, TrendingUp } from 'lucide-react'
import { formatCurrency, getMonthName, getCategoryInfo } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FinancialReportPDF } from '@/components/pdf/FinancialReport'
import { useT } from '@/context/LanguageContext'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

export default function ReportsPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [categoryExpenses, setCategoryExpenses] = useState<any[]>([])
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [userName, setUserName] = useState('Usuario')

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth, selectedYear])

  const fetchReportData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
    setUserName(name)

    const monthStr = String(selectedMonth).padStart(2, '0')
    const start = `${selectedYear}-${monthStr}-01`
    const end = `${selectedYear}-${monthStr}-31`

    // Transactions for selected month
    const { data: txData } = await supabase.from('transactions').select('*').gte('date', start).lte('date', end).order('date', { ascending: false })
    const txList = txData || []
    const inc = txList.filter((t) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0)
    const exp = txList.filter((t) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0)
    setIncome(inc)
    setExpenses(exp)

    // Category breakdown
    const catMap: Record<string, number> = {}
    txList.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount
    })
    setCategoryExpenses(
      Object.entries(catMap).map(([key, val]) => ({ category: getCategoryInfo(key).label, amount: val })).sort((a, b) => b.amount - a.amount)
    )

    // Last 6 months comparison
    const months6: any[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - 1 - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const ms = `${y}-${String(m).padStart(2, '0')}-01`
      const me = `${y}-${String(m).padStart(2, '0')}-31`
      const { data: txM } = await supabase.from('transactions').select('amount, type').gte('date', ms).lte('date', me)
      const mInc = (txM || []).filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0)
      const mExp = (txM || []).filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0)
      months6.push({ month: d.toLocaleString('es-ES', { month: 'short' }), ingresos: mInc, gastos: mExp, ahorro: Math.max(0, mInc - mExp) })
    }
    setMonthlyComparison(months6)

    // Budgets for PDF
    const { data: budgets } = await supabase.from('budgets').select('*').eq('month', selectedMonth).eq('year', selectedYear)
    const { data: goals } = await supabase.from('saving_goals').select('*')
    const { data: fp } = await supabase.from('fixed_payments').select('*').eq('is_active', true)
    const { data: fpStatus } = await supabase.from('fixed_payment_status').select('*').eq('month', selectedMonth).eq('year', selectedYear)
    const paidIds = new Set((fpStatus || []).filter((s: any) => s.is_paid).map((s: any) => s.fixed_payment_id))

    setReportData({
      userName: name,
      month: getMonthName(selectedMonth),
      year: selectedYear,
      income: inc,
      expenses: exp,
      savings: Math.max(0, inc - exp),
      transactions: txList.map((t: any) => ({
        description: t.description,
        category: getCategoryInfo(t.category).label,
        date: new Date(t.date).toLocaleDateString('es-ES'),
        amount: t.amount,
        type: t.type,
      })),
      budgets: (budgets || []).map((b: any) => ({
        category: getCategoryInfo(b.category).label,
        limit: b.limit_amount,
        spent: catMap[b.category] || 0,
      })),
      savingGoals: (goals || []).map((g: any) => ({
        name: g.name,
        targetAmount: g.target_amount,
        savedAmount: g.saved_amount,
        targetDate: new Date(g.target_date).toLocaleDateString('es-ES'),
      })),
      fixedPayments: (fp || []).map((p: any) => ({
        name: p.name,
        amount: p.amount,
        isPaid: paidIds.has(p.id),
      })),
    })

    setLoading(false)
  }

  const savingsRate = income > 0 ? ((Math.max(0, income - expenses) / income) * 100).toFixed(1) : '0'

  return (
    <div>
      <Header title={t.reports.title} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="input w-36 md:w-40">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="input w-24 md:w-28">
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {reportData && (
            <PDFDownloadLink
              document={<FinancialReportPDF data={reportData} />}
              fileName={`spentcontrol-${getMonthName(selectedMonth)}-${selectedYear}.pdf`}
            >
              {(({ loading: pdfL }: { loading: boolean }) => (
                <button className="btn-primary flex items-center gap-2 text-sm" disabled={pdfL || loading}>
                  <Download className="w-4 h-4" />
                  {pdfL ? t.reports.generatingPdf : t.reports.exportPdf}
                </button>
              )) as any}
            </PDFDownloadLink>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card" style={{ background: '#f0fdf4' }}>
            <p className="text-xs text-gray-500 font-medium">{t.reports.income}</p>
            <p className="text-xl font-bold mt-1 text-green-600">{loading ? '...' : formatCurrency(income)}</p>
          </div>
          <div className="card" style={{ background: '#fff5f5' }}>
            <p className="text-xs text-gray-500 font-medium">{t.reports.expenses}</p>
            <p className="text-xl font-bold mt-1 text-red-500">{loading ? '...' : formatCurrency(expenses)}</p>
          </div>
          <div className="card" style={{ background: '#fff5f0' }}>
            <p className="text-xs text-gray-500 font-medium">{t.reports.netSavings}</p>
            <p className="text-xl font-bold mt-1" style={{ color: '#ff6b35' }}>{loading ? '...' : formatCurrency(Math.max(0, income - expenses))}</p>
          </div>
          <div className="card" style={{ background: '#faf5ff' }}>
            <p className="text-xs text-gray-500 font-medium">{t.reports.savingsRate}</p>
            <p className="text-xl font-bold mt-1 text-purple-600">{loading ? '...' : `${savingsRate}%`}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#ff6b35' }} />
              {t.reports.monthlyComparison}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                <Legend />
                <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              {t.reports.savingsTrend}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                <Line type="monotone" dataKey="ahorro" stroke="#ff6b35" strokeWidth={2.5} dot={{ r: 4 }} name="Ahorro" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryExpenses.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t.reports.categoryBreakdown} — {getMonthName(selectedMonth)} {selectedYear}</h2>
            <div className="space-y-3">
              {categoryExpenses.map((cat, i) => {
                const pct = expenses > 0 ? (cat.amount / expenses) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-gray-500">{formatCurrency(cat.amount)} <span className="text-gray-400">({Math.round(pct)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#ff6b35' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
