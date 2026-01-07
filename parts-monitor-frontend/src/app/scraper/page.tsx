'use client'

import { useState, useEffect } from 'react'
import { scraperApi, productApi } from '@/lib/api'
import {
  Search,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Globe,
  Clock,
  AlertTriangle,
  Download,
} from 'lucide-react'

interface ScrapingJob {
  id: number
  productId: string
  status: 'waiting' | 'active' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: string
}

interface Product {
  id: string
  partNumber: string
  partName: string
  manufacturer: string
  currentPrice?: number
}

interface SupportedSite {
  id: string
  name: string
  url: string
}

export default function ScraperPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [supportedSites, setSupportedSites] = useState<SupportedSite[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'batch' | 'single'>('batch')

  useEffect(() => {
    loadProducts()
    loadSupportedSites()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await productApi.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadSupportedSites = async () => {
    try {
      const data = await scraperApi.getSupportedSites()
      setSupportedSites(data.sites)
      if (data.sites.length > 0) {
        setSelectedSite(data.sites[0].id)
      }
    } catch (error) {
      console.error('Failed to load supported sites:', error)
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  const runBatchScrape = async () => {
    if (selectedProducts.length === 0) return

    setLoading(true)
    try {
      const response = await scraperApi.runBatchScrape(selectedProducts)
      setJobs((prev) => [
        ...prev,
        {
          id: response.jobId,
          productId: selectedProducts.join(','),
          status: 'active',
          progress: 0,
          createdAt: new Date().toISOString(),
        },
      ])

      pollJobStatus(response.jobId)
    } catch (error) {
      console.error('Failed to start batch scrape:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSingleScrape = async () => {
    if (!selectedProducts[0] || !selectedSite || !customUrl) return

    setLoading(true)
    try {
      const response = await scraperApi.runSingleScrape(
        selectedProducts[0],
        selectedSite,
        customUrl,
      )
      setJobs((prev) => [
        ...prev,
        {
          id: Date.now(),
          productId: selectedProducts[0],
          status: 'active',
          progress: 0,
          result: response.data,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Failed to start single scrape:', error)
    } finally {
      setLoading(false)
    }
  }

  const pollJobStatus = async (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const status = await scraperApi.getJobStatus(jobId.toString())
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: status.state,
                  progress: status.progress,
                  result: status.data,
                }
              : job,
          ),
        )

        if (
          status.state === 'completed' ||
          status.state === 'failed'
        ) {
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Failed to check job status:', error)
        clearInterval(interval)
      }
    }, 2000)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'active':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            스크래핑 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            제품 가격과 재고 정보를 실시간으로 스크래핑합니다.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('batch')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'batch'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              일괄 스크래핑
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              단일 스크래핑
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Product Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                제품 선택
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={selectAllProducts}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {selectedProducts.length === products.length
                    ? '모두 해제'
                    : '모두 선택'}
                </button>
                <button
                  onClick={loadProducts}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="제품명 또는 부품번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Product List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => toggleProductSelection(product.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {product.partName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.partNumber} · {product.manufacturer}
                      </div>
                      {product.currentPrice && (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          {formatPrice(product.currentPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeTab === 'batch' && (
              <button
                onClick={runBatchScrape}
                disabled={selectedProducts.length === 0 || loading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                {loading ? '스크래핑 중...' : `${selectedProducts.length}개 제품 스크래핑 시작`}
              </button>
            )}
          </div>

          {/* Right Panel - Single Scrape Settings */}
          {activeTab === 'single' && selectedProducts.length === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                단일 스크래핑 설정
              </h2>

              <div className="space-y-4">
                {/* Site Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    스크래핑 사이트
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {supportedSites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => setSelectedSite(site.id)}
                        className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                          selectedSite === site.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">{site.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    제품 URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Run Button */}
                <button
                  onClick={runSingleScrape}
                  disabled={!customUrl || !selectedSite || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Play className="w-5 h-5" />
                  {loading ? '스크래핑 중...' : '단일 스크래핑 시작'}
                </button>
              </div>
            </div>
          )}

          {/* Job History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              스크래핑 기록
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  스크래핑 기록이 없습니다.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(job.status)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          제품 ID: {job.productId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(job.createdAt).toLocaleString('ko-KR')}
                        </div>
                        {job.progress > 0 && job.status === 'active' && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              진행률: {Math.round(job.progress)}%
                            </div>
                          </div>
                        )}
                        {job.status === 'failed' && job.error && (
                          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {job.error}
                          </div>
                        )}
                        {job.status === 'completed' && job.result && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="text-sm font-medium text-green-800 dark:text-green-200">
                              스크래핑 완료
                            </div>
                            {job.result.prices && (
                              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                                {job.result.prices.length}개 가격 정보 수집
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
