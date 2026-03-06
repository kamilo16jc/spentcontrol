import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getMonthName(month: number) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return months[month - 1]
}

export const CATEGORIES = [
  { label: 'Alimentacion', value: 'food', icon: '🍔', color: '#F59E0B' },
  { label: 'Transporte', value: 'transport', icon: '🚗', color: '#3B82F6' },
  { label: 'Salud', value: 'health', icon: '💊', color: '#EF4444' },
  { label: 'Educacion', value: 'education', icon: '📚', color: '#8B5CF6' },
  { label: 'Entretenimiento', value: 'entertainment', icon: '🎬', color: '#EC4899' },
  { label: 'Ropa', value: 'clothing', icon: '👕', color: '#14B8A6' },
  { label: 'Hogar', value: 'home', icon: '🏠', color: '#F97316' },
  { label: 'Servicios', value: 'services', icon: '💡', color: '#6366F1' },
  { label: 'Ahorros', value: 'savings', icon: '💰', color: '#10B981' },
  { label: 'Ingresos', value: 'income', icon: '💵', color: '#22C55E' },
  { label: 'Otros', value: 'other', icon: '📦', color: '#94A3B8' },
]

export function getCategoryInfo(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}
