'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, Target, Calendar, TrendingUp, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useT } from '@/context/LanguageContext'

interface SavingGoal {
  id: string
  name: string
  description: string | null
  target_amount: number
  saved_amount: number
  target_date: string
  color: string
}

function getMonthsLeft(targetDate: string) {
  const now = new Date()
  const target = new Date(targetDate)
  const months = (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth()
  return Math.max(0, months)
}

export default function SavingsPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showContributeModal, setShowContributeModal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '', color: '#ff6b35' })
  const [contributeAmount, setContributeAmount] = useState('')

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    setLoading(true)
    const { data } = await supabase.from('saving_goals').select('*').order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.saved_amount, 0)

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('saving_goals').insert({
      user_id: user!.id,
      name: form.name,
      description: form.description || null,
      target_amount: parseFloat(form.targetAmount),
      saved_amount: 0,
      target_date: form.targetDate,
      color: form.color,
    }).select().single()

    if (data) setGoals([data, ...goals])
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', targetAmount: '', targetDate: '', description: '', color: '#ff6b35' })
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showContributeModal) return
    setSaving(true)
    const goal = goals.find((g) => g.id === showContributeModal)!
    const newAmount = Math.min(goal.saved_amount + parseFloat(contributeAmount), goal.target_amount)

    await supabase.from('saving_goals').update({ saved_amount: newAmount }).eq('id', showContributeModal)
    setGoals(goals.map((g) => g.id === showContributeModal ? { ...g, saved_amount: newAmount } : g))
    setSaving(false)
    setShowContributeModal(null)
    setContributeAmount('')
  }

  const handleDelete = async (id: string) => {
    await supabase.from('saving_goals').delete().eq('id', id)
    setGoals(goals.filter((g) => g.id !== id))
  }

  return (
    <div>
      <Header title={t.savings.title} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">{t.savings.totalGoal}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTarget)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.savings.totalSaved}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.savings.remaining}</p>
            <p className="text-2xl font-bold" style={{ color: '#ff6b35' }}>{formatCurrency(totalTarget - totalSaved)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t.savings.myGoals}</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t.savings.newGoal}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t.savings.loading}</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">{t.savings.empty}</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-sm font-semibold" style={{ color: '#ff6b35' }}>{t.savings.createFirst}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
              const monthsLeft = getMonthsLeft(goal.target_date)
              const remaining = goal.target_amount - goal.saved_amount
              const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : remaining

              return (
                <div key={goal.id} className="card space-y-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
                        <Target className="w-5 h-5" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                        {goal.description && <p className="text-xs text-gray-400">{goal.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pct === 100 && <span className="badge bg-green-100 text-green-700">{t.savings.completed}</span>}
                      <button onClick={() => handleDelete(goal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-gray-900">{formatCurrency(goal.saved_amount)}</span>
                      <span className="text-gray-400">de {formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-1">{Math.round(pct)}%</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-gray-400">{t.savings.targetDate}</p>
                        <p className="font-medium text-gray-700">{formatDate(new Date(goal.target_date))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-gray-400">{t.savings.monthlyNeeded}</p>
                        <p className="font-medium text-gray-700">{formatCurrency(monthlyNeeded)}</p>
                      </div>
                    </div>
                  </div>

                  {pct < 100 && (
                    <button
                      onClick={() => setShowContributeModal(goal.id)}
                      className="w-full text-sm font-medium py-2 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: goal.color }}
                    >
                      {t.savings.addSaving}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a2e' }}>{t.savings.newGoalTitle}</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="label">{t.savings.goalName}</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder={t.savings.placeholder} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.savings.targetAmount}</label>
                  <input required type="number" min="1" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">{t.savings.targetDateLabel}</label>
                  <input required type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label">{t.savings.description}</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="Descripcion de la meta" />
              </div>
              <div>
                <label className="label">{t.savings.color}</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input h-10 p-1 cursor-pointer" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t.savings.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? t.savings.saving : t.savings.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a2e' }}>{t.savings.addSaving}</h2>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="label">{t.savings.amountToAdd}</label>
                <input required type="number" min="1" step="0.01" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} className="input" placeholder="0.00" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowContributeModal(null)} className="btn-secondary flex-1">{t.savings.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? t.savings.saving : t.savings.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
