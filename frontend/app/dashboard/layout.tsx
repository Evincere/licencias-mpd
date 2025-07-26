'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
