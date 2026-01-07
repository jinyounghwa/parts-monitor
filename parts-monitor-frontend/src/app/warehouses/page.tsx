'use client'

import { useEffect, useState } from 'react'
import { warehouseApi, excelApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Download,
} from 'lucide-react'
import Link from 'next/link'

interface Warehouse {
  id: string
  code: string
  name: string
  address: string
  manager: string
  phone: string
  isActive: boolean
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [newWarehouse, setNewWarehouse] = useState({
    code: '',
    name: '',
    address: '',
    manager: '',
    phone: '',
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const data = await warehouseApi.getAll()

      // If no data from API, use sample data
      if (!data || data.length === 0) {
        const sampleData = [
          {
            id: '1',
            code: 'WH-001',
            name: '서울 본사',
            address: '서울시 강남구 테헤란로 123',
            manager: '이준호',
            phone: '02-1234-5678',
            isActive: true,
          },
          {
            id: '2',
            code: 'WH-002',
            name: '경기 센터',
            address: '경기도 성남시 분당구 정자로 456',
            manager: '박지수',
            phone: '031-9876-5432',
            isActive: true,
          },
          {
            id: '3',
            code: 'WH-003',
            name: '부산 지점',
            address: '부산시 해운대구 중앙로 789',
            manager: '김민석',
            phone: '051-5555-7777',
            isActive: true,
          },
        ]
        setWarehouses(sampleData)
        return
      }

      setWarehouses(data)
    } catch (err: any) {
      // Use sample data on error
      const sampleData = [
        {
          id: '1',
          code: 'WH-001',
          name: '서울 본사',
          address: '서울시 강남구 테헤란로 123',
          manager: '이준호',
          phone: '02-1234-5678',
          isActive: true,
        },
      ]
      setWarehouses(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWarehouse = async () => {
    if (!newWarehouse.code || !newWarehouse.name) {
      setError('코드와 이름은 필수입니다')
      return
    }
    try {
      await warehouseApi.create(newWarehouse)
      setShowAddModal(false)
      setNewWarehouse({ code: '', name: '', address: '', manager: '', phone: '' })
      fetchWarehouses()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateWarehouse = async (id: string) => {
    try {
      await warehouseApi.update(id, editData)
      setEditingId(null)
      setEditData({})
      fetchWarehouses()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('이 창고를 삭제하시겠습니까?')) return
    try {
      await warehouseApi.delete(id)
      fetchWarehouses()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleExportWarehouses = async () => {
    try {
      setExporting(true)
      const blob = await excelApi.exportProducts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `warehouses-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || '창고 내보내기 실패')
    } finally {
      setExporting(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">창고 관리</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportWarehouses}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2 text-black dark:text-black"
          >
            <Download className="h-4 w-4" />
            {exporting ? '내보내는 중...' : '엑셀 내보내기'}
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 창고 추가
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>등록된 창고가 없습니다</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">코드: {warehouse.code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    warehouse.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {warehouse.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingId === warehouse.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">주소</label>
                      <input
                        type="text"
                        value={editData.address || warehouse.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">담당자</label>
                      <input
                        type="text"
                        value={editData.manager || warehouse.manager}
                        onChange={(e) => setEditData({ ...editData, manager: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">전화</label>
                      <input
                        type="text"
                        value={editData.phone || warehouse.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setEditData({})
                        }}
                        className="text-black dark:text-black"
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateWarehouse(warehouse.id)}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">주소:</span> {warehouse.address || '-'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">담당자:</span> {warehouse.manager || '-'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">전화:</span> {warehouse.phone || '-'}
                    </p>
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link href={`/warehouses/${warehouse.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1 text-black dark:text-black">
                          <Eye className="w-3 h-3" />
                          보기
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(warehouse.id)
                          setEditData(warehouse)
                        }}
                        className="flex items-center gap-1 text-black dark:text-black"
                      >
                        <Edit className="w-3 h-3" />
                        편집
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 창고 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>새 창고 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  창고 코드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWarehouse.code}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })}
                  placeholder="예: WH-001"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  창고 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  placeholder="예: 서울 본사"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">주소</label>
                <input
                  type="text"
                  value={newWarehouse.address}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                  placeholder="창고 주소"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">담당자</label>
                <input
                  type="text"
                  value={newWarehouse.manager}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                  placeholder="담당자 이름"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">전화</label>
                <input
                  type="text"
                  value={newWarehouse.phone}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                  placeholder="전화번호"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewWarehouse({ code: '', name: '', address: '', manager: '', phone: '' })
                  }}
                  className="text-black dark:text-black"
                >
                  취소
                </Button>
                <Button onClick={handleAddWarehouse}>추가</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
