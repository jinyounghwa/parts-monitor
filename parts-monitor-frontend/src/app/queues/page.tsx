'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { RefreshCw, Trash2, AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { queueApi } from '@/lib/api'

interface QueueJob {
  id: string
  name: string
  status: 'pending' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
}

export default function QueuesPage() {
  const [loading, setLoading] = useState(true)
  const [scrapingJobs, setScrapingJobs] = useState<QueueJob[]>([])
  const [notificationJobs, setNotificationJobs] = useState<QueueJob[]>([])
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchQueues()

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchQueues()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchQueues = async () => {
    try {
      setLoading(true)
      // In a real app, this would call queueApi.getQueues()
      // For now, we'll show placeholder data
      setScrapingJobs([
        {
          id: '1',
          name: 'Scrape Mouser Electronics',
          status: 'completed',
          progress: 100,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ])
      setNotificationJobs([])
    } catch (err: any) {
      setError(err.message || '큐 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryJob = async (jobId: string, queueName: string) => {
    // Implementation would call: queueApi.retryJob(queueName, jobId)
    alert('재시도 기능은 관리자 권한이 필요합니다')
  }

  const handleDeleteJob = async (jobId: string, queueName: string) => {
    // Implementation would call: queueApi.deleteJob(queueName, jobId)
    alert('삭제 기능은 관리자 권한이 필요합니다')
  }

  const handleAddJob = async (queueName: string) => {
    const jobData = prompt(`추가할 ${queueName === 'scraping' ? '스크래핑' : '알림'} 작업 데이터를 JSON 형식으로 입력하세요 (예: {"productId": "123"})`, '{}')
    if (!jobData) return

    try {
      let parsedData = {}
      try {
        parsedData = JSON.parse(jobData)
      } catch (e) {
        alert('유효하지 않은 JSON 형식입니다.')
        return
      }

      await queueApi.createJob(queueName, parsedData)
      fetchQueues()
      alert('작업이 추가되었습니다.')
    } catch (err: any) {
      setError(err.message || '작업 추가 실패')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
    }
  }

  if (loading && scrapingJobs.length === 0 && notificationJobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">큐 관리</h1>
        <div className="flex gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">자동 새로고침</span>
          </label>
          <Button onClick={() => handleAddJob('scraping')} variant="outline" className="flex items-center gap-2 text-black dark:text-black">
            <Plus className="w-4 h-4" />
            스크래핑 큐 추가
          </Button>
          <Button onClick={() => handleAddJob('notification')} variant="outline" className="flex items-center gap-2 text-black dark:text-black">
            <Plus className="w-4 h-4" />
            알림 큐 추가
          </Button>
          <Button onClick={fetchQueues} variant="outline" className="flex items-center gap-2 text-black dark:text-black">
            <RefreshCw className="w-4 h-4" />
            새로고침
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Scraping Queue */}
      <Card>
        <CardHeader>
          <CardTitle>스크래핑 큐</CardTitle>
        </CardHeader>
        <CardContent>
          {scrapingJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>진행 중인 스크래핑 작업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scrapingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-gray-900 dark:text-white">{job.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status === 'completed' ? '완료' : job.status === 'failed' ? '실패' : '진행 중'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {job.progress}% - {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {job.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryJob(job.id, 'scraping')}
                      >
                        재시도
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id, 'scraping')}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>알림 큐</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>진행 중인 알림 작업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-gray-900 dark:text-white">{job.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status === 'completed' ? '완료' : job.status === 'failed' ? '실패' : '진행 중'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {job.progress}% - {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {job.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryJob(job.id, 'notification')}
                      >
                        재시도
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id, 'notification')}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>큐 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">스크래핑 큐</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">{scrapingJobs.filter(j => j.status === 'completed').length}</p>
                  <p className="text-xs text-gray-500">완료</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{scrapingJobs.filter(j => j.status === 'pending').length}</p>
                  <p className="text-xs text-gray-500">진행 중</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{scrapingJobs.filter(j => j.status === 'failed').length}</p>
                  <p className="text-xs text-gray-500">실패</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">알림 큐</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">{notificationJobs.filter(j => j.status === 'completed').length}</p>
                  <p className="text-xs text-gray-500">완료</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{notificationJobs.filter(j => j.status === 'pending').length}</p>
                  <p className="text-xs text-gray-500">진행 중</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{notificationJobs.filter(j => j.status === 'failed').length}</p>
                  <p className="text-xs text-gray-500">실패</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
