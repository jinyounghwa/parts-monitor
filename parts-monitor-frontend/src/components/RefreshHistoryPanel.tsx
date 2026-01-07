import { useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface RefreshHistoryPanelProps {
  productId?: string
  isOpen: boolean
  onClose: () => void
}

export function RefreshHistoryPanel({
  productId,
  isOpen,
  onClose,
}: RefreshHistoryPanelProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')

  // Fetch refresh history
  const { data: history, isLoading } = useQuery({
    queryKey: ['refresh-history', productId],
    queryFn: () =>
      api
        .get(`/api/products${productId ? `/${productId}` : ''}/history`, {
          params: { limit: 50 },
        })
        .then((res) => res.data),
    enabled: isOpen,
  })

  const filteredHistory = history?.filter((item: any) => {
    if (filter === 'all') return true
    if (filter === 'success') return item.success
    if (filter === 'failed') return !item.success
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {productId ? '제품 갱신 내역' : '전체 갱신 내역'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              제품 정보 갱신 및 스크래핑 기록
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-4 bg-gray-50 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            성공
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            실패
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    제품
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    사이트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    가격 변화
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    재고 변화
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    소요 시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    갱신 일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    유형
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">
                        {item.product?.partNumber || '-'}
                      </div>
                      <div className="text-gray-500">
                        {item.product?.partName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.site}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.priceChanged ? (
                        <div className="flex items-center gap-1">
                          {item.priceChangePercent > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                          <span
                            className={
                              item.priceChangePercent > 0
                                ? 'text-red-600 font-medium'
                                : 'text-green-600 font-medium'
                            }
                          >
                            {item.oldPrice?.toLocaleString()} →{' '}
                            {item.newPrice?.toLocaleString()}원
                          </span>
                          <span
                            className={`text-xs ${
                              item.priceChangePercent > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            ({item.priceChangePercent?.toFixed(1)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.stockChanged ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-900">
                            {item.oldStock} → {item.newStock}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.scrapeDuration}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.scrapedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.triggerType === 'manual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.triggerType === 'manual' ? '수동' : '자동'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <RefreshCw className="w-12 h-12 mb-4 text-gray-400" />
              <p>갱신 내역이 없습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
