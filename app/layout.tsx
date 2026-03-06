import type { Metadata } from 'next'
import { Nunito, Nunito_Sans } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/AppShell'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['400','600','700','800','900'] })
const nunitoSans = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito-sans', weight: ['400','500','600','700'] })

export const metadata: Metadata = {
  title: 'SpentControl - Gestiona tus finanzas personales',
  description: 'Controla tus gastos, presupuestos, pagos fijos y metas de ahorro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} ${nunitoSans.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
