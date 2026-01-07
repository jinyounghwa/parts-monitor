'use client'

import { useState, useEffect } from 'react'
import { notificationApi, productApi, inventoryApi } from '@/lib/api'
import {
  Mail,
  Bell,
  AlertTriangle,
  Package,
  Send,
  Plus,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

interface Recipient {
  id: string
  email: string
  name?: string
}

interface LowStockItem {
  id: string
  productId: string
  product: {
    partNumber: string
    partName: string
  }
  quantity: number
  safetyStock: number
  status: string
}

interface PriceAlert {
  product: {
    partNumber: string
    partName: string
  }
  changes: {
    priceChange: number
    previousPrice: number
    currentPrice: number
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'price' | 'custom'>('stock')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '' })
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [alertType, setAlertType] = useState<'lowStock' | 'priceAlert'>('lowStock')

  useEffect(() => {
    loadLowStockItems()
    // Default recipients (can be loaded from user preferences)
    setRecipients([
      { id: '1', email: 'admin@example.com', name: 'Admin' },
    ])
  }, [])

  const loadLowStockItems = async () => {
    setLoading(true)
    try {
      const data = await inventoryApi.getLowStockAlerts()
      setLowStockItems(data)
    } catch (error) {
      console.error('Failed to load low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRecipient = () => {
    if (!newRecipient.email) return

    const recipient: Recipient = {
      id: Date.now().toString(),
      email: newRecipient.email,
      name: newRecipient.name || undefined,
    }

    setRecipients([...recipients, recipient])
    setNewRecipient({ email: '', name: '' })
  }

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id))
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    )
  }

  const selectAllItems = () => {
    if (selectedItems.length === lowStockItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(lowStockItems.map((item) => item.id))
    }
  }

  const sendLowStockAlert = async () => {
    if (selectedItems.length === 0 || recipients.length === 0) {
      alert('제품과 수신자를 선택해주세요.')
      return
    }

    setSending(true)
    try {
      const itemsToSend = lowStockItems.filter((item) =>
        selectedItems.includes(item.id),
      )

      await notificationApi.sendLowStockAlert(
        recipients.map((r) => r.email),
        itemsToSend,
      )

      alert('재고 부족 알림이 발송되었습니다.')
      setSelectedItems([])
    } catch (error) {
      console.error('Failed to send low stock alert:', error)
      alert('알림 발송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  const sendPriceAlert = async () => {
    if (recipients.length === 0) {
      alert('수신자를 선택해주세요.')
      return
    }

    setSending(true)
    try {
      // Mock price alert data - in real app, this would come from actual price changes
      const alertData = {
        product: lowStockItems[0]?.product || {
          partNumber: 'TEST-001',
          partName: '테스트 제품',
        },
        changes: {
          priceChange: -10.5,
          previousPrice: 1000,
          currentPrice: 895,
        },
      }

      await notificationApi.sendPriceAlert(
        recipients.map((r) => r.email),
        alertData,
      )

      alert('가격 알림이 발송되었습니다.')
    } catch (error) {
      console.error('Failed to send price alert:', error)
      alert('알림 발송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  const sendCustomReport = async () => {
    if (recipients.length === 0) {
      alert('수신자를 선택해주세요.')
      return
    }

    setSending(true)
    try {
      const reportData = {
        date: new Date().toISOString(),
        summary: {
          totalProducts: lowStockItems.length,
          lowStockItems: lowStockItems.length,
        },
        products: lowStockItems,
      }

      await notificationApi.sendDailyReport(
        recipients.map((r) => r.email),
        reportData,
      )

      alert('일일 리포트가 발송되었습니다.')
    } catch (error) {
      console.error('Failed to send daily report:', error)
      alert('리포트 발송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'critical':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return '재고없음'
      case 'critical':
        return '긴급'
      case 'low':
        return '부족'
      default:
        return '정상'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            알림 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            재고 부족, 가격 변동 등의 알림을 이메일로 발송합니다.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'stock'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4" />
              재고 부족 알림
            </button>
            <button
              onClick={() => setActiveTab('price')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'price'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              가격 변동 알림
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4" />
              커스텀 리포트
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              수신자
            </h2>

            {/* Recipients List */}
            <div className="space-y-2 mb-4">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {recipient.name || '이름 없음'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {recipient.email}
                    </div>
                  </div>
                  <button
                    onClick={() => removeRecipient(recipient.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Recipient Form */}
            <div className="border-t pt-4">
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={newRecipient.email}
                  onChange={(e) =>
                    setNewRecipient({ ...newRecipient, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  placeholder="이름 (선택)"
                  value={newRecipient.name}
                  onChange={(e) =>
                    setNewRecipient({ ...newRecipient, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={addRecipient}
                  disabled={!newRecipient.email}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  수신자 추가
                </button>
              </div>
            </div>
          </div>

          {/* Center/Right Panel - Content */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'stock' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    재고 부족 제품
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllItems}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      {selectedItems.length === lowStockItems.length
                        ? '모두 해제'
                        : '모두 선택'}
                    </button>
                    <button
                      onClick={loadLowStockItems}
                      disabled={loading}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Loader2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Low Stock Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : lowStockItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>재고 부족 제품이 없습니다.</p>
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedItems.includes(item.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.product.partName}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  item.status,
                                )}`}
                              >
                                {getStatusText(item.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.product.partNumber}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-gray-900 dark:text-white font-medium">
                                현재고: {item.quantity}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                안전재고: {item.safetyStock}
                              </span>
                              <span
                                className={`${
                                  item.quantity < item.safetyStock
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                                } font-medium`}
                              >
                                {item.quantity < item.safetyStock
                                  ? `부족 (-${item.safetyStock - item.quantity})`
                                  : '충분'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={sendLowStockAlert}
                  disabled={selectedItems.length === 0 || recipients.length === 0 || sending}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      재고 부족 알림 발송
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'price' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  가격 변동 알림
                </h2>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                        가격 변동 감지 시 자동 알림
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        설정한 임계값 이상의 가격 변동이 발생하면 자동으로 알림을
                        보냅니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Alert Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      알림 유형
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="alertType"
                          value="lowStock"
                          checked={alertType === 'lowStock'}
                          onChange={() => setAlertType('lowStock')}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          가격 하락
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="alertType"
                          value="priceAlert"
                          checked={alertType === 'priceAlert'}
                          onChange={() => setAlertType('priceAlert')}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          가격 상승
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      임계값 (%)
                    </label>
                    <input
                      type="number"
                      placeholder="예: 10"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={sendPriceAlert}
                    disabled={recipients.length === 0 || sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        가격 알림 발송
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  커스텀 리포트 발송
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      리포트 유형
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>일일 리포트</option>
                      <option>주간 리포트</option>
                      <option>월간 리포트</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      메시지
                    </label>
                    <textarea
                      rows={4}
                      placeholder="추가 메시지를 입력하세요..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    onClick={sendCustomReport}
                    disabled={recipients.length === 0 || sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        리포트 발송
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
