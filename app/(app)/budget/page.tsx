'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, AlertTriangle, Trash2 } from 'lucide-react'
import { formatCurrency, CATEGORIES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useT } from '@/context/LanguageContext'

interface Budget {
  id: string
  category: string
  limit_amount: number
  month: number
  year: number
  spent?: number
}

export default function BudgetPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ category: 'food', limit: '' })
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    setLoading(true)
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month)
      .eq('year', year)

    const { data: txData } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'EXPENSE')
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('date', `${year}-${String(month).padStart(2, '0')}-31`)

    const spentByCategory: Record<string, number> = {}
    txData?.forEach((tx) => {
      spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + tx.amount
    })

    const merged = (budgetData || []).map((b) => ({
      ...b,
      spent: spentByCategory[b.category] || 0,
    }))

    setBudgets(merged)
    setLoading(false)
  }

  const totalLimit = budgets.reduce((s, b) => s + b.limit_amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user!.id,
        category: form.category,
        limit_amount: parseFloat(form.limit),
        month,
        year,
      }, { onConflict: 'user_id,category,month,year' })
      .select()
      .single()

    if (!error) {
      await fetchBudgets()
    }
    setSaving(false)
    setShowModal(false)
    setForm({ category: 'food', limit: '' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  return (
    <div>
      <Header title={t.budget.title} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">{t.budget.totalBudget}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLimit)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.budget.totalSpent}</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.budget.available}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalLimit - totalSpent)}</p>
          </div>
        </div>

        {totalLimit > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t.budget.totalUsage}</span>
              <span className="text-sm font-bold text-gray-900">{Math.round((totalSpent / totalLimit) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', totalSpent / totalLimit > 0.85 ? 'bg-red-500' : 'bg-green-500')}
                style={{ width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatCurrency(totalSpent)} de {formatCurrency(totalLimit)}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t.budget.categories}</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            {t.budget.addBudget}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t.budget.loading}</div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">{t.budget.empty}</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-sm font-semibold" style={{ color: '#ff6b35' }}>
              {t.budget.createFirst}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => {
              const cat = CATEGORIES.find((c) => c.value === budget.category)!
              const pct = (budget.spent || 0) / budget.limit_amount * 100
              const isOver = pct >= 100
              const isWarning = pct >= 80 && !isOver

              return (
                <div key={budget.id} className="card group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat?.icon}</span>
                      <span className="font-semibold text-gray-800">{cat?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOver && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {isWarning && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">{t.budget.spent}</span>
                    <span className={cn('font-semibold', isOver ? 'text-red-500' : 'text-gray-800')}>
                      {formatCurrency(budget.spent || 0)}
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn('h-full rounded-full transition-all', isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-400' : 'bg-green-500')}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{Math.round(pct)}{t.budget.used}</span>
                    <span>{t.budget.limit}: {formatCurrency(budget.limit_amount)}</span>
                  </div>

                  {isOver && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      {t.budget.exceeded} {formatCurrency((budget.spent || 0) - budget.limit_amount)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a2e' }}>{t.budget.addBudget}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t.transactions.category}</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                >
                  {CATEGORIES.filter((c) => c.value !== 'income').map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t.budget.monthlyLimit}</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t.budget.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? t.budget.saving : t.budget.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
