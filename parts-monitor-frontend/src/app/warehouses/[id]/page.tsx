'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { warehouseApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

interface WarehouseProduct {
  id: string
  partNumber: string
  partName: string
  quantity: number
  status: string
  location: string
}

export default function WarehouseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [warehouse, setWarehouse] = useState<any>(null)
  const [products, setProducts] = useState<WarehouseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWarehouseData()
  }, [id])

  const fetchWarehouseData = async () => {
    try {
      setLoading(true)
      const [warehouseData, productsData] = await Promise.all([
        warehouseApi.getById(id),
        warehouseApi.getProducts(id)
      ])
      setWarehouse(warehouseData)
      setProducts(productsData.products || [])
    } catch (err: any) {
      setError(err.message || '창고 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return
    try {
      const results = await warehouseApi.searchProducts(id, searchQuery)
      setProducts(results.products || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'sufficient': 'bg-green-100 text-green-800',
      'low': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-orange-100 text-orange-800',
      'out_of_stock': 'bg-red-100 text-red-800',
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

  if (!warehouse) {
    return (
      <div className="space-y-4">
        <Link href="/warehouses">
          <Button variant="outline" className="text-black dark:text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </Link>
        <Alert variant="destructive">창고 정보를 찾을 수 없습니다</Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/warehouses">
          <Button variant="outline" size="sm" className="text-black dark:text-black">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{warehouse.name}</h1>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>창고 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">코드</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{warehouse.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">상태</p>
            <p className="text-lg font-medium">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                warehouse.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {warehouse.isActive ? '활성' : '비활성'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">주소</p>
            <p className="text-lg text-gray-900 dark:text-white">{warehouse.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">담당자</p>
            <p className="text-lg text-gray-900 dark:text-white">{warehouse.manager || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">전화</p>
            <p className="text-lg text-gray-900 dark:text-white">{warehouse.phone || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>제품 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="제품 검색..."
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white w-64"
                />
              </div>
              <Button size="sm" onClick={handleSearch} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                검색
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>이 창고에는 제품이 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">제품 번호</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">제품명</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">수량</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">위치</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.partNumber}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{product.partName}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{product.quantity}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{product.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
