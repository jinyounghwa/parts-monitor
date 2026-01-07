'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { dashboardApi } from '@/lib/api'
import type { PriceAlert, StockAlert } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Bell,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

type AlertTab = 'all' | 'price' | 'stock'

export default function AlertsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AlertTab>('all')
  const [alerts, setAlerts] = useState<{ priceAlerts: PriceAlert[]; stockAlerts: StockAlert[] } | null>(null)
  const [filteredPriceAlerts, setFilteredPriceAlerts] = useState<PriceAlert[]>([])
  const [filteredStockAlerts, setFilteredStockAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getAlerts(limit)
        setAlerts(data)
        setFilteredPriceAlerts(data.priceAlerts)
        setFilteredStockAlerts(data.stockAlerts)
      } catch (err: any) {
        setError(err.message || '알림 목록을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAlerts()
    }
  }, [isAuthenticated, authLoading, router, limit])

  useEffect(() => {
    if (!alerts) return

    if (activeTab === 'all') {
      setFilteredPriceAlerts(alerts.priceAlerts)
      setFilteredStockAlerts(alerts.stockAlerts)
    } else if (activeTab === 'price') {
      setFilteredPriceAlerts(alerts.priceAlerts)
      setFilteredStockAlerts([])
    } else if (activeTab === 'stock') {
      setFilteredPriceAlerts([])
      setFilteredStockAlerts(alerts.stockAlerts)
    }
  }, [activeTab, alerts])

  const allAlerts = [
    ...filteredPriceAlerts.map((alert) => ({ ...alert, type: 'price' as const })),
    ...filteredStockAlerts.map((alert) => ({ ...alert, type: 'stock' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value))
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">알림</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">가격 및 재고 관련 알림</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={limit}
              onChange={handleLimitChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10} className="text-black">최근 10개</option>
              <option value={20} className="text-black">최근 20개</option>
              <option value={50} className="text-black">최근 50개</option>
              <option value={100} className="text-black">최근 100개</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({allAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('price')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'price'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              가격 ({alerts?.priceAlerts.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="h-4 w-4" />
              재고 ({alerts?.stockAlerts.length || 0})
            </button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </Alert>
      )}

      {allAlerts.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'all' ? '알림이 없습니다' : 
               activeTab === 'price' ? '가격 알림이 없습니다' : '재고 알림이 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              새로운 알림이 생성되면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allAlerts.map((alert, idx) => (
            <Card
              key={`alert-${idx}`}
              className={`border-l-4 ${
                alert.type === 'price'
                  ? 'border-l-orange-500'
                  : 'border-l-red-500'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.type === 'price' ? (
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      ) : (
                        <Package className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {alert.product}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{alert.site}</span>
                      <span>{formatDateTime(alert.date)}</span>
                    </div>
                  </div>
                  {alert.type === 'price' && (
                    <div
                      className={`text-2xl font-bold px-3 py-1 rounded-lg ${
                        (alert as PriceAlert).change > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {(alert as PriceAlert).change > 0 ? '+' : ''}
                      {(alert as PriceAlert).change.toFixed(1)}%
                    </div>
                  )}
                  {alert.type === 'stock' && (
                    <div className="text-2xl font-bold px-3 py-1 rounded-lg bg-red-100 text-red-800">
                      {(alert as StockAlert).quantity}개
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {allAlerts.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              if (limit < 100) {
                setLimit(limit + 50)
              }
            }}
          >
            더 많은 알림 불러오기
          </Button>
        </div>
      )}
    </div>
  )
}
