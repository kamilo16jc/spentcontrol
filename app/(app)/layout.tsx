import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { LanguageProvider } from '@/context/LanguageContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </LanguageProvider>
  )
}
