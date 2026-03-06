import Sidebar from '@/components/layout/Sidebar'
import { LanguageProvider } from '@/context/LanguageContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}
