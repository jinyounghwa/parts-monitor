'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Warehouse,
  FileText,
  Users,
  Settings,
  ShoppingCart,
  Globe,
  Mail,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/products', label: '제품', icon: Package },
  { href: '/inventory', label: '재고 관리', icon: Warehouse },
  { href: '/quotations', label: '견적', icon: FileText },
  { href: '/scraper', label: '스크래핑', icon: Globe },
  { href: '/notifications', label: '알림', icon: Mail },
  { href: '/warehouses', label: '창고', icon: ShoppingCart },
  { href: '/customers', label: '고객', icon: Users },
  { href: '/alerts', label: '경고', icon: Bell },
  { href: '/queues', label: '작업 큐', icon: Settings },
  { href: '/admin', label: '관리', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  return (
    <>
      {/* 모바일 헤더 */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold">Parts Monitor</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-gray-800 p-2 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 pt-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'w-64 bg-gray-900 text-white fixed left-0 top-0 h-screen transition-transform duration-300 z-40 flex flex-col',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Parts Monitor</h1>
          </div>
        </div>

        {/* 모바일 헤더 공간 */}
        <div className="h-16 md:hidden" />

        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 사용자 정보 및 로그아웃 */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded-lg">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>
    </>
  )
}
