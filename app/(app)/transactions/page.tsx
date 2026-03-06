'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, getCategoryInfo, CATEGORIES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useT } from '@/context/LanguageContext'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
}

interface TransactionFormData {
  description: string
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
}

export default function TransactionsPage() {
  const supabase = createClientComponentClient()
  const { t } = useT()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<TransactionFormData>({
    description: '',
    amount: '',
    type: 'EXPENSE',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  const filtered = transactions.filter((tx) => {
    const matchType = filter === 'ALL' || tx.type === filter
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user!.id,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
    }).select().single()

    if (!error && data) {
      setTransactions([data, ...transactions])
    }
    setSaving(false)
    setShowModal(false)
    setForm({ description: '', amount: '', type: 'EXPENSE', category: 'food', date: new Date().toISOString().split('T')[0] })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  return (
    <div>
      <Header title={t.transactions.title} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.transactions.income}</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.transactions.expenses}</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fff5f0' }}>
              <span className="font-bold text-sm" style={{ color: '#ff6b35' }}>$</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.transactions.balance}</p>
              <p className={cn('text-lg font-bold', totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-500')}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.transactions.search}
                  style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', border: '1.5px solid #ede9e3', borderRadius: '10px', outline: 'none', background: '#f7f3ee' }}
                />
              </div>
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #ede9e3' }}>
                {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: filter === f ? '#ff6b35' : 'transparent',
                      color: filter === f ? 'white' : '#888',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {f === 'ALL' ? t.transactions.all : f === 'INCOME' ? t.transactions.income : t.transactions.expenses}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              {t.transactions.newTransaction}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">{t.transactions.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">{t.transactions.empty}</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm font-semibold" style={{ color: '#ff6b35' }}>
                {t.transactions.addFirst}
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.transactions.description}</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.transactions.category}</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.transactions.date}</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">{t.transactions.amount}</th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((tx) => {
                  const cat = getCategoryInfo(tx.category)
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-medium text-gray-800">{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">{formatDate(new Date(tx.date))}</td>
                      <td className="py-3 text-right">
                        <span className={cn('text-sm font-semibold', tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500')}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a2e' }}>{t.transactions.newTransaction}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t.transactions.description}</label>
                <input
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  placeholder={t.transactions.placeholder}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.transactions.amount}</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">{t.transactions.type}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                    className="input"
                  >
                    <option value="EXPENSE">{t.transactions.expense}</option>
                    <option value="INCOME">{t.transactions.income}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.transactions.category}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t.transactions.date}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t.transactions.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? t.transactions.saving : t.transactions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
