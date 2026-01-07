'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Navigation } from '@/components/Navigation'
import { Loading } from '@/components/ui/Loading'

export default function CustomersLayout({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loading size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navigation />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
