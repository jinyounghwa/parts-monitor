import { RefreshCw, CheckCircle, XCircle, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface DashboardRefreshStatsProps {
  onViewHistory: () => void
}

export function DashboardRefreshStats({
  onViewHistory,
}: DashboardRefreshStatsProps) {
  // Fetch refresh stats from dashboard
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () =>
      api.get('/api/dashboard/summary').then((res) => res.data),
    refetchInterval: 60000, // Refetch every minute
  })

  const scraping = stats?.scraping

  if (!scraping) return null

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">정보 갱신 통계</h3>
        <button
          onClick={onViewHistory}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Activity className="w-4 h-4" />
          내역 보기
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">전체 갱신</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {scraping.total.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            총 갱신 횟수
          </div>
        </div>

        {/* Success */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">성공</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {scraping.success.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 mt-1">
            성공 갱신 횟수
          </div>
        </div>

        {/* Failed */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">실패</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {scraping.failed.toLocaleString()}
          </div>
          <div className="text-xs text-red-600 mt-1">
            실패 갱신 횟수
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm font-medium">성공률</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {scraping.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-purple-600 mt-1">
            성공 비율
          </div>
        </div>
      </div>

      {/* Recent Refreshes */}
      {scraping.recent && scraping.recent.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            최근 갱신 내역
          </h4>
          <div className="space-y-2">
            {scraping.recent.slice(0, 5).map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {item.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {item.product?.partNumber || item.product?.partName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.site} · {item.triggerType === 'manual' ? '수동' : '자동'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(item.scrapedAt).toLocaleTimeString('ko-KR')}
                  </div>
                  {item.priceChanged && (
                    <div className="text-xs font-medium">
                      {item.oldPrice?.toLocaleString()} →{' '}
                      {item.newPrice?.toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
