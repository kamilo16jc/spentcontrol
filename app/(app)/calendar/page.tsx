'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, Check, Clock, Repeat, Trash2 } from 'lucide-react'
import { formatCurrency, CATEGORIES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useT } from '@/context/LanguageContext'

interface FixedPayment {
  id: string
  name: string
  amount: number
  category: string
  frequency: string
  day_of_month: number
  color: string
  is_paid?: boolean
  status_id?: string
}

const freqLabels: Record<string, string> = {
  DAILY: 'Diario', WEEKLY: 'Semanal', MONTHLY: 'Mensual', YEARLY: 'Anual',
}

export default function CalendarPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const [payments, setPayments] = useState<FixedPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', category: 'services', frequency: 'MONTHLY', dayOfMonth: '1', color: '#ff6b35' })
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthName = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data: fp } = await supabase.from('fixed_payments').select('*').eq('is_active', true).order('day_of_month')
    const { data: status } = await supabase.from('fixed_payment_status').select('*').eq('month', month).eq('year', year)

    const merged = (fp || []).map((p) => {
      const s = status?.find((st) => st.fixed_payment_id === p.id)
      return { ...p, is_paid: s?.is_paid || false, status_id: s?.id }
    })
    setPayments(merged)
    setLoading(false)
  }

  const totalMonthly = payments.reduce((s, p) => s + p.amount, 0)
  const totalPaid = payments.filter((p) => p.is_paid).reduce((s, p) => s + p.amount, 0)

  const togglePaid = async (payment: FixedPayment) => {
    const { data: { user } } = await supabase.auth.getUser()
    const newPaid = !payment.is_paid

    if (payment.status_id) {
      await supabase.from('fixed_payment_status').update({ is_paid: newPaid }).eq('id', payment.status_id)
    } else {
      await supabase.from('fixed_payment_status').insert({
        fixed_payment_id: payment.id,
        user_id: user!.id,
        month,
        year,
        is_paid: newPaid,
      })
    }
    setPayments(payments.map((p) => p.id === payment.id ? { ...p, is_paid: newPaid } : p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('fixed_payments').insert({
      user_id: user!.id,
      name: form.name,
      amount: parseFloat(form.amount),
      category: form.category,
      frequency: form.frequency,
      day_of_month: parseInt(form.dayOfMonth),
      color: form.color,
    }).select().single()

    if (data) {
      setPayments([...payments, { ...data, is_paid: false }])
    }
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', amount: '', category: 'services', frequency: 'MONTHLY', dayOfMonth: '1', color: '#ff6b35' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('fixed_payments').delete().eq('id', id)
    setPayments(payments.filter((p) => p.id !== id))
  }

  // Days in current month
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  return (
    <div>
      <Header title={t.calendar.title} />
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">{t.calendar.totalMonthly}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthly)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.calendar.paid}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">{t.calendar.pending}</p>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalMonthly - totalPaid)}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 capitalize">{t.calendar.monthView} - {monthName}</h2>
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayPayments = payments.filter((p) => p.day_of_month === day)
              return (
                <div key={day} className={cn('min-h-[60px] rounded-lg p-1 border text-xs', dayPayments.length > 0 ? 'border-orange-100 bg-orange-50' : 'border-gray-100 bg-white')}>
                  <span className="text-gray-500 font-medium">{day}</span>
                  {dayPayments.map((p) => (
                    <div key={p.id} className="mt-1 px-1 py-0.5 rounded text-white text-[10px] font-medium truncate" style={{ backgroundColor: p.color }}>
                      {p.name}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t.calendar.paymentsList}</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t.calendar.addPayment}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t.calendar.loading}</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">{t.calendar.empty}</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-sm font-semibold" style={{ color: '#ff6b35' }}>{t.calendar.addFirst}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...payments].sort((a, b) => a.day_of_month - b.day_of_month).map((pay) => {
              const cat = CATEGORIES.find((c) => c.value === pay.category)
              return (
                <div key={pay.id} className={cn('card flex items-center gap-4 group', pay.is_paid && 'opacity-60')}>
                  <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: pay.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{pay.name}</span>
                      <span className="badge bg-gray-100 text-gray-500">{cat?.icon}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />{freqLabels[pay.frequency]}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Dia {pay.day_of_month}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(pay.amount)}</p>
                    <button
                      onClick={() => togglePaid(pay)}
                      className={cn('mt-1 text-xs px-2 py-1 rounded-full font-medium transition-colors', pay.is_paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600 hover:bg-orange-200')}
                    >
                      {pay.is_paid ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />{t.calendar.paidLabel}</span> : t.calendar.markPaid}
                    </button>
                  </div>
                  <button onClick={() => handleDelete(pay.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a2e' }}>{t.calendar.newPayment}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t.calendar.name}</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder={t.calendar.placeholder} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.calendar.amount}</label>
                  <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">{t.calendar.dayOfMonth}</label>
                  <input required type="number" min="1" max="31" value={form.dayOfMonth} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.calendar.frequency}</label>
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="input">
                    <option value="DAILY">{t.calendar.daily}</option>
                    <option value="WEEKLY">{t.calendar.weekly}</option>
                    <option value="MONTHLY">{t.calendar.monthly}</option>
                    <option value="YEARLY">{t.calendar.yearly}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t.calendar.color}</label>
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input h-10 p-1 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="label">{t.calendar.category}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                  {CATEGORIES.filter((c) => c.value !== 'income').map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t.calendar.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? t.calendar.saving : t.calendar.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
