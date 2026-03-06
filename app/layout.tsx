import type { Metadata } from 'next'
import { Nunito, Nunito_Sans } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/AppShell'
import PWARegister from '@/components/PWARegister'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['400','600','700','800','900'] })
const nunitoSans = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito-sans', weight: ['400','500','600','700'] })

export const metadata: Metadata = {
  title: 'SpentControl - Gestiona tus finanzas personales',
  description: 'Controla tus gastos, presupuestos, pagos fijos y metas de ahorro',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SpentControl' },
  other: { 'mobile-web-app-capable': 'yes' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#ff6b35" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${nunito.variable} ${nunitoSans.variable} font-sans`}>
        <PWARegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
