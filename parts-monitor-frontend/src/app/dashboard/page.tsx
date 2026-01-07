'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { dashboardApi } from '@/lib/api'
import type { DashboardStats, PriceAlert, StockAlert } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import dynamic from 'next/dynamic'

const DashboardScene = dynamic(() => import('@/components/canvas/DashboardScene'), {
  ssr: false,
})

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<{ priceAlerts: PriceAlert[]; stockAlerts: StockAlert[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, alertsData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getAlerts(10),
        ])
        setStats(statsData)
        setAlerts(alertsData)
      } catch (err: any) {
        setError(err.message || '데이터를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, authLoading, router, isClient])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">{error}</Alert>
      </div>
    )
  }

  const totalAlerts = (alerts?.priceAlerts.length || 0) + (alerts?.stockAlerts.length || 0)

  return (
    <div className="space-y-6 pt-4 md:pt-0">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">대시보드</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">전자 부품 모니터링 현황</p>
        </div>
        <div className="w-32 h-32 -my-4">
          <DashboardScene status={totalAlerts > 5 ? 'error' : totalAlerts > 0 ? 'warning' : 'normal'} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              전체 제품
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats?.totalProducts || 0}</span>
              <Package className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              가격 변동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {stats?.significantPriceChanges || 0}
              </span>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">
              재고 부족
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {stats?.lowStockAlerts || 0}
              </span>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              마지막 스크래핑
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {stats?.lastScrapeAt ? formatDateTime(stats.lastScrapeAt) : '없음'}
              </span>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">가격 알림</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts?.priceAlerts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">가격 알림 없음</p>
            ) : (
              <div className="space-y-3">
                {alerts?.priceAlerts.slice(0, 5).map((alert, idx) => (
                  <div
                    key={`price-${idx}`}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{alert.product}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.site}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDateTime(alert.date)}
                      </p>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        alert.change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {alert.change > 0 ? '+' : ''}
                      {alert.change.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">재고 알림</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts?.stockAlerts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">재고 알림 없음</p>
            ) : (
              <div className="space-y-3">
                {alerts?.stockAlerts.slice(0, 5).map((alert, idx) => (
                  <div
                    key={`stock-${idx}`}
                    className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{alert.product}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.site}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDateTime(alert.date)}
                      </p>
                    </div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {alert.quantity}개
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {totalAlerts > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              총 <span className="font-bold mx-1">{totalAlerts}</span>개의 알림이
              있습니다. 알림 페이지에서 자세한 내용을 확인하세요.
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
