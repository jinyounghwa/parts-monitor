'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { productApi, dashboardApi, scraperApi } from '@/lib/api'
import type { Product, PriceHistory } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import dynamic from 'next/dynamic'

export default function ProductDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = (params?.id as string) || ''

  const [product, setProduct] = useState<Product | null>(null)
  const [priceHistories, setPriceHistories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapingJobId, setScrapingJobId] = useState<number | null>(null)
  const [scrapingStatus, setScrapingStatus] = useState<string>('')
  const [scrapingResult, setScrapingResult] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [productData, historyData] = await Promise.all([
          productApi.getById(productId),
          dashboardApi.getProductPriceHistory(productId, 30),
        ])
        setProduct(productData)
        setPriceHistories(historyData.data || [])
      } catch (err: any) {
        setError(err.message || '제품 정보를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, authLoading, router, productId])

  const handleDelete = async () => {
    if (!confirm('정말 이 제품을 삭제하시겠습니까?')) {
      return
    }

    try {
      await productApi.delete(productId)
      router.push('/products')
    } catch (err: any) {
      setError(err.message || '제품 삭제에 실패했습니다')
    }
  }

  const handleRefresh = async () => {
    try {
      setError('')
      setLoading(true)
      const [productData, historyData] = await Promise.all([
        productApi.getById(productId),
        dashboardApi.getProductPriceHistory(productId, 30),
      ])
      setProduct(productData)
      setPriceHistories(historyData.data || [])
    } catch (err: any) {
      setError(err.message || '데이터를 새로고치는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleManualScrape = async () => {
    try {
      setScraping(true)
      setScrapingStatus('스크래핑 시작...')
      setScrapingResult(null)
      setError('')

      // Start scraping job
      const result = await scraperApi.runManualScrape(productId)
      setScrapingJobId(result.jobId)
      setScrapingStatus(`작업 ID: ${result.jobId} - 진행 중...`)

      // Poll for job completion (check every 2 seconds, max 60 seconds)
      let isCompleted = false
      let attempts = 0
      const maxAttempts = 30

      while (!isCompleted && attempts < maxAttempts) {
        attempts++
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
          const status = await scraperApi.getScrapingStatus()

          // Check if our job is in completed or failed jobs
          if (status.jobs?.completed) {
            const completedJob = status.jobs.completed.find(
              (job: any) => job.id === result.jobId
            )
            if (completedJob) {
              setScrapingStatus('✅ 스크래핑 완료!')
              setScrapingResult(completedJob)
              isCompleted = true

              // Refresh data to show new scraping results
              await handleRefresh()
              break
            }
          }

          if (status.jobs?.failed) {
            const failedJob = status.jobs.failed.find(
              (job: any) => job.id === result.jobId
            )
            if (failedJob) {
              setScrapingStatus('❌ 스크래핑 실패')
              setScrapingResult(failedJob)
              setError(`스크래핑 실패: ${failedJob.failedReason || '알 수 없는 오류'}`)
              isCompleted = true
              break
            }
          }

          // Update status showing active jobs
          if (status.jobs?.active?.length > 0) {
            setScrapingStatus(`진행 중... (대기 중: ${status.stats?.waiting || 0}개)`)
          }
        } catch (statusErr) {
          // Continue polling even if status check fails
          setScrapingStatus(`진행 중... (${attempts}/${maxAttempts})`)
        }
      }

      if (!isCompleted) {
        setScrapingStatus('⏱️ 스크래핑 시간 초과')
        setError('스크래핑이 완료되지 않았습니다. 나중에 다시 확인해주세요.')
      }
    } catch (err: any) {
      setError(err.message || '스크래핑 요청 실패')
      setScrapingStatus('❌ 요청 실패')
    } finally {
      setScraping(false)
    }
  }

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

  if (!product) {
    return null
  }

  const chartData = priceHistories.map((h) => ({
    date: new Date(h.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    price: h.price,
    stock: h.stockQuantity,
  }))

  const averagePrice = priceHistories.length > 0
    ? priceHistories.reduce((sum, h) => sum + h.price, 0) / priceHistories.length
    : 0

  const minPrice = priceHistories.length > 0
    ? Math.min(...priceHistories.map((h) => h.price))
    : 0

  const maxPrice = priceHistories.length > 0
    ? Math.max(...priceHistories.map((h) => h.price))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          목록으로
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualScrape}
          disabled={scraping}
          className="text-black"
        >
          <Download className="h-4 w-4 mr-1" />
          {scraping ? '스크래핑 중...' : '수동 스크래핑'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="text-black"
        >
          <Activity className="h-4 w-4 mr-1" />
          새로고침
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/products/${productId}/edit`)}
          className="text-black"
        >
          <Edit className="h-4 w-4 mr-1" />
          편집
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          삭제
        </Button>
      </div>

      {/* 스크래핑 상태 카드 */}
      {scrapingStatus && (
        <Card className={`border-2 ${scrapingStatus.includes('✅') ? 'border-green-500' : scrapingStatus.includes('❌') ? 'border-red-500' : 'border-blue-500'}`}>
          <CardHeader>
            <CardTitle className="text-lg">스크래핑 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{scrapingStatus}</p>
                {scrapingJobId && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Job ID: {scrapingJobId}</p>
                )}
              </div>
              {scraping && (
                <div className="animate-spin">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>

            {scrapingResult && (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">시작:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {scrapingResult.processedOn ? new Date(scrapingResult.processedOn).toLocaleString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">완료:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {scrapingResult.finishedOn ? new Date(scrapingResult.finishedOn).toLocaleString() : '-'}
                  </span>
                </div>
                {scrapingResult.failedReason && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">오류:</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{scrapingResult.failedReason}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>가격 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                가격 이력이 없습니다
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`} />
                  <Tooltip
                    formatter={(value: any) => [
                      `₩${value.toLocaleString()}`,
                      '가격',
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>가격 통계</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">평균</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPrice(averagePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">최저</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {formatPrice(minPrice)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">최고</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-semibold text-red-600">
                    {formatPrice(maxPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            제품 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">부품 번호</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {product.partNumber}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">제조사</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {product.manufacturer}
              </dd>
            </div>

            {product.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">설명</dt>
                <dd className="text-gray-900 dark:text-white mt-1">{product.description}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">상태</dt>
              <dd className="mt-1">
                {product.isActive ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    활성
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    비활성
                  </span>
                )}
              </dd>
            </div>

            {product.alertThreshold.priceChangePercent > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">가격 변동 알림</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {product.alertThreshold.priceChangePercent}%
                </dd>
              </div>
            )}

            {product.alertThreshold.stockMin > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">최소 재고 알림</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {product.alertThreshold.stockMin}개
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">생성일</dt>
              <dd className="text-gray-900 dark:text-white mt-1">{formatDate(product.createdAt)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">업데이트일</dt>
              <dd className="text-gray-900 dark:text-white mt-1">
                {formatDate(product.updatedAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 이력</CardTitle>
        </CardHeader>
        <CardContent>
          {priceHistories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              가격 이력이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {priceHistories.slice(0, 10).map((history, idx) => (
                <div
                  key={`history-${idx}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{history.site}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(history.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(history.prices?.[0]?.unitPrice || 0)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {history.prices?.[0]?.currency || 'KRW'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">재고: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {history.stockQuantity}개
                        </span>
                      </div>
                      {history.priceChange !== undefined && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">변동: </span>
                          <span
                            className={`font-semibold ${
                              history.priceChange > 0
                                ? 'text-red-600'
                                : history.priceChange < 0
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {history.priceChange > 0 ? '+' : ''}
                            {history.priceChange.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 수량별 가격 정보 */}
                  {history.prices && history.prices.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        수량별 가격
                      </p>
                      <div className="space-y-2">
                        {history.prices.map((pricePoint: any, pIdx: number) => (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              수량: {pricePoint.quantity}개 이상
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatPrice(pricePoint.unitPrice)} / {pricePoint.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}