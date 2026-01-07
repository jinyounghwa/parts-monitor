'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { quotationApi, customerApi, productApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface QuotationItem {
  productId: string
  quantity: number
  unitPrice: number
  description?: string
}

export default function CreateQuotationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<QuotationItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }])

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId || items.some(item => !item.productId)) {
      setError('모든 필수 항목을 입력해주세요')
      return
    }

    try {
      setLoading(true)
      await quotationApi.create({
        customerId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity.toString()),
          unitPrice: parseFloat(item.unitPrice.toString()),
          description: item.description,
        })),
      })
      router.push('/quotations')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quotations">
          <Button variant="outline" size="sm" className="text-black dark:text-black">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">새 견적 생성</h1>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>견적 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                고객 <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">고객 선택</option>
                {/* 실제로는 고객 목록을 로드해야 함 */}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  품목 <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  품목 추가
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        제품
                      </label>
                      <input
                        type="text"
                        placeholder="제품 ID"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        수량
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        단가
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex gap-3 justify-end">
              <Link href="/quotations">
                <Button variant="outline">취소</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? '생성 중...' : '견적 생성'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
