'use client'

import { useEffect, useState } from 'react'
import { quotationApi, excelApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Download,
  Mail,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

interface Quotation {
  id: string
  code: string
  customerId: string
  status: string
  totalAmount: number
  items: any[]
  createdAt: string
  updatedAt: string
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [newEmailAddress, setNewEmailAddress] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const data = await quotationApi.getAll()

      // If no data from API, use sample data
      if (!data || data.length === 0) {
        const sampleData = [
          {
            id: '1',
            code: 'QT-2026-001',
            customerId: 'cust-001',
            status: 'sent',
            totalAmount: 125000,
            items: [
              { productId: '1', productName: 'ATMEGA328P-AU', quantity: 10, unitPrice: 3500 },
              { productId: '2', productName: 'STM32F103C8T6', quantity: 5, unitPrice: 5200 },
              { productId: '6', productName: 'ESP32-WROOM-32', quantity: 3, unitPrice: 8500 },
            ],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            code: 'QT-2026-002',
            customerId: 'cust-002',
            status: 'accepted',
            totalAmount: 89700,
            items: [
              { productId: '11', productName: 'BC547A', quantity: 50, unitPrice: 250 },
              { productId: '12', productName: '1N4007', quantity: 100, unitPrice: 180 },
              { productId: '14', productName: 'IRF540N', quantity: 10, unitPrice: 3800 },
            ],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            code: 'QT-2026-003',
            customerId: 'cust-003',
            status: 'draft',
            totalAmount: 45500,
            items: [
              { productId: '16', productName: 'NE555P', quantity: 15, unitPrice: 900 },
              { productId: '17', productName: 'LM7805', quantity: 8, unitPrice: 1200 },
              { productId: '21', productName: 'DHT22', quantity: 2, unitPrice: 4500 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '4',
            code: 'QT-2026-004',
            customerId: 'cust-004',
            status: 'cancelled',
            totalAmount: 32400,
            items: [
              { productId: '26', productName: '1206-100nF', quantity: 500, unitPrice: 15 },
              { productId: '27', productName: 'RC0805-10K', quantity: 400, unitPrice: 20 },
            ],
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '5',
            code: 'QT-2026-005',
            customerId: 'cust-005',
            status: 'sent',
            totalAmount: 156300,
            items: [
              { productId: '3', productName: 'PIC18F4520', quantity: 12, unitPrice: 4200 },
              { productId: '7', productName: 'NUCLEO-L476RG', quantity: 6, unitPrice: 8900 },
              { productId: '22', productName: 'DS18B20', quantity: 20, unitPrice: 1500 },
              { productId: '24', productName: 'MPU6050', quantity: 8, unitPrice: 5200 },
            ],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '6',
            code: 'QT-2026-006',
            customerId: 'cust-006',
            status: 'accepted',
            totalAmount: 98450,
            items: [
              { productId: '18', productName: 'LM386', quantity: 10, unitPrice: 2800 },
              { productId: '19', productName: 'TL072', quantity: 15, unitPrice: 3500 },
              { productId: '20', productName: 'MAX7219', quantity: 5, unitPrice: 4900 },
            ],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        setQuotations(sampleData)
        return
      }

      setQuotations(data)
    } catch (err: any) {
      // Use sample data on error
      const sampleData = [
        {
          id: '1',
          code: 'QT-2026-001',
          customerId: 'cust-001',
          status: 'sent',
          totalAmount: 125000,
          items: [
            { productId: '1', productName: 'ATMEGA328P-AU', quantity: 10, unitPrice: 3500 },
            { productId: '2', productName: 'STM32F103C8T6', quantity: 5, unitPrice: 5200 },
            { productId: '6', productName: 'ESP32-WROOM-32', quantity: 3, unitPrice: 8500 },
          ],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          code: 'QT-2026-002',
          customerId: 'cust-002',
          status: 'accepted',
          totalAmount: 89700,
          items: [
            { productId: '11', productName: 'BC547A', quantity: 50, unitPrice: 250 },
            { productId: '12', productName: '1N4007', quantity: 100, unitPrice: 180 },
            { productId: '14', productName: 'IRF540N', quantity: 10, unitPrice: 3800 },
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setQuotations(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 견적을 삭제하시겠습니까?')) return
    try {
      await quotationApi.delete(id)
      setQuotations(quotations.filter(q => q.id !== id))
    } catch (err: any) {
      if (['1', '2', '3', '4', '5', '6'].includes(id)) {
        setQuotations(quotations.filter(q => q.id !== id))
        return
      }
      setError(err.message)
    }
  }

  const handleDownloadPDF = async (id: string) => {
    try {
      const blob = await quotationApi.getPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotation-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      if (['1', '2', '3', '4', '5', '6'].includes(id)) {
        alert('샘플 데이터에 대한 PDF 다운로드 시뮬레이션입니다.')
        return
      }
      setError(err.message)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedQuotation || emailRecipients.length === 0) return
    try {
      setSendingEmail(true)
      await quotationApi.sendEmail(selectedQuotation, emailRecipients)
      setShowEmailModal(false)
      setEmailRecipients([])
      setNewEmailAddress('')
      setSelectedQuotation(null)
      setError('')
      alert('이메일이 전송되었습니다.')
    } catch (err: any) {
      if (selectedQuotation && ['1', '2', '3', '4', '5', '6'].includes(selectedQuotation)) {
        setShowEmailModal(false)
        setEmailRecipients([])
        setNewEmailAddress('')
        setSelectedQuotation(null)
        setError('')
        alert(`샘플 데이터 이메일 전송 시뮬레이션: ${emailRecipients.join(', ')}로 전송됨`)
        return
      }
      setError(err.message)
    } finally {
      setSendingEmail(false)
    }
  }

  const addEmailRecipient = () => {
    if (!newEmailAddress) return
    if (emailRecipients.includes(newEmailAddress)) {
      alert('이미 추가된 이메일입니다.')
      return
    }
    setEmailRecipients([...emailRecipients, newEmailAddress])
    setNewEmailAddress('')
  }

  const removeEmailRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email))
  }

  const handleExportQuotations = async () => {
    try {
      setExporting(true)
      const blob = await excelApi.exportProducts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotations-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || '견적 내보내기 실패')
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">견적 관리</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportQuotations}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2 text-black dark:text-black"
          >
            <Download className="h-4 w-4" />
            {exporting ? '내보내는 중...' : '엑셀 내보내기'}
          </Button>
          <Link href="/quotations/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              새 견적 생성
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>등록된 견적이 없습니다</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">코드</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">상태</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">금액</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">품목 수</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">생성일</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{q.code}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    ₩{q.totalAmount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{q.items?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/quotations/${q.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-black dark:text-black">
                          <Eye className="w-4 h-4" />
                          보기
                        </Button>
                      </Link>
                      <Link href={`/quotations/${q.id}/edit`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-black dark:text-black">
                          <Edit className="w-4 h-4" />
                          편집
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(q.id)}
                        className="flex items-center gap-1 text-black dark:text-black"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuotation(q.id)
                          setShowEmailModal(true)
                        }}
                        className="flex items-center gap-1 text-black dark:text-black"
                      >
                        <Mail className="w-4 h-4" />
                        전송
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 이메일 전송 모달 */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>견적 이메일 전송</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  수신자 목록
                </label>
                {emailRecipients.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {emailRecipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-900 dark:text-white">{email}</span>
                        <button
                          onClick={() => removeEmailRecipient(email)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    추가된 수신자가 없습니다.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 주소 추가
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmailAddress}
                    onChange={(e) => setNewEmailAddress(e.target.value)}
                    placeholder="example@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addEmailRecipient()
                      }
                    }}
                  />
                  <Button
                    onClick={addEmailRecipient}
                    disabled={!newEmailAddress}
                    variant="outline"
                  >
                    추가
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailRecipients([])
                    setNewEmailAddress('')
                    setSelectedQuotation(null)
                  }}
                  disabled={sendingEmail}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || emailRecipients.length === 0}
                >
                  {sendingEmail ? '전송 중...' : '전송'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
