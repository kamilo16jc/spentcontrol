import { cn, formatCurrency } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  amount: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'purple'
  trend?: { value: number; positive: boolean }
  currency?: string
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', iconBg: 'bg-green-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
}

export default function StatCard({ title, amount, icon: Icon, color, trend, currency }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className="card" style={{ borderLeft: '4px solid #ff6b35' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(amount, currency)}</p>
          {trend && (
            <p className={cn('text-xs mt-1 font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  )
}
