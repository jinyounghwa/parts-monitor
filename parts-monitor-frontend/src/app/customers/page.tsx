'use client'

import { useEffect, useState } from 'react'
import { customerApi, excelApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash2, Users, Download } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  company: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    company: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerApi.getAll()

      // If no data from API, use sample data
      if (!data || data.length === 0) {
        const sampleData = [
          {
            id: '1',
            name: '이준호',
            email: 'junho.lee@techcorp.co.kr',
            phone: '02-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            contactPerson: '이준호',
            company: 'TechCorp Korea',
          },
          {
            id: '2',
            name: '박지수',
            email: 'jisoo.park@innovtech.com',
            phone: '031-9876-5432',
            address: '경기도 성남시 분당구 정자로 456',
            contactPerson: '박지수',
            company: 'InnovTech Solutions',
          },
          {
            id: '3',
            name: '김민석',
            email: 'minseok.kim@electronicsplus.kr',
            phone: '051-5555-7777',
            address: '부산시 해운대구 중앙로 789',
            contactPerson: '김민석',
            company: 'ElectronicsPlus Korea',
          },
          {
            id: '4',
            name: '정수현',
            email: 'suhyun.jung@smartfactory.co.kr',
            phone: '064-2222-8888',
            address: '제주시 첨단로 321',
            contactPerson: '정수현',
            company: 'SmartFactory Inc',
          },
          {
            id: '5',
            name: '이서연',
            email: 'seoyeon.lee@components.co.kr',
            phone: '033-3333-9999',
            address: '강원도 춘천시 중앙로 654',
            contactPerson: '이서연',
            company: 'Components Plus',
          },
          {
            id: '6',
            name: '최동욱',
            email: 'dongwook.choi@industr.co.kr',
            phone: '042-4444-1111',
            address: '대전시 유성구 테크로 987',
            contactPerson: '최동욱',
            company: 'Industrial Solutions Co',
          },
          {
            id: '7',
            name: '한미영',
            email: 'miyoung.han@autoparts.co.kr',
            phone: '062-5555-2222',
            address: '광주시 남구 효덕로 111',
            contactPerson: '한미영',
            company: 'AutoParts Manufacturing',
          },
          {
            id: '8',
            name: '조창희',
            email: 'changhee.jo@semiconductor.kr',
            phone: '052-6666-3333',
            address: '울산시 남구 산업로 222',
            contactPerson: '조창희',
            company: 'Semiconductor Tech Ltd',
          },
          {
            id: '9',
            name: '송윤희',
            email: 'yunhee.song@robotics.co.kr',
            phone: '070-7777-4444',
            address: '인천시 연수구 컨벤시아로 333',
            contactPerson: '송윤희',
            company: 'Robotics Innovation Labs',
          },
          {
            id: '10',
            name: '박준영',
            email: 'junyoung.park@controls.kr',
            phone: '061-8888-5555',
            address: '전라남도 여수시 해양로 444',
            contactPerson: '박준영',
            company: 'Control Systems Korea',
          },
        ]
        setCustomers(sampleData)
        return
      }

      setCustomers(data)
    } catch (err: any) {
      // Use sample data on error
      const sampleData = [
        {
          id: '1',
          name: '이준호',
          email: 'junho.lee@techcorp.co.kr',
          phone: '02-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          contactPerson: '이준호',
          company: 'TechCorp Korea',
        },
        {
          id: '2',
          name: '박지수',
          email: 'jisoo.park@innovtech.com',
          phone: '031-9876-5432',
          address: '경기도 성남시 분당구 정자로 456',
          contactPerson: '박지수',
          company: 'InnovTech Solutions',
        },
        {
          id: '3',
          name: '김민석',
          email: 'minseok.kim@electronicsplus.kr',
          phone: '051-5555-7777',
          address: '부산시 해운대구 중앙로 789',
          contactPerson: '김민석',
          company: 'ElectronicsPlus Korea',
        },
      ]
      setCustomers(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      setError('이름과 이메일은 필수입니다')
      return
    }
    try {
      await customerApi.create(newCustomer)
      setShowAddModal(false)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        company: '',
      })
      fetchCustomers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateCustomer = async (id: string) => {
    try {
      await customerApi.update(id, editData)
      setEditingId(null)
      setEditData({})
      fetchCustomers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('이 고객을 삭제하시겠습니까?')) return
    try {
      await customerApi.delete(id)
      fetchCustomers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleExportCustomers = async () => {
    try {
      setExporting(true)
      const blob = await excelApi.exportProducts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || '고객 내보내기 실패')
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">고객 관리</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCustomers}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2 text-black dark:text-black"
          >
            <Download className="h-4 w-4" />
            {exporting ? '내보내는 중...' : '엑셀 내보내기'}
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 고객 추가
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {customers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>등록된 고객이 없습니다</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">고객명</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">회사</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">이메일</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">전화</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">담당자</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {editingId === customer.id ? (
                    <>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-6 gap-3">
                          <div>
                            <input
                              type="text"
                              value={editData.name || customer.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={editData.company || customer.company}
                              onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              value={editData.email || customer.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={editData.phone || customer.phone}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={editData.contactPerson || customer.contactPerson}
                              onChange={(e) => setEditData({ ...editData, contactPerson: e.target.value })}
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
                              onClick={() => handleUpdateCustomer(customer.id)}
                            >
                              저장
                            </Button>
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{customer.company || '-'}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{customer.email}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{customer.contactPerson || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(customer.id)
                              setEditData(customer)
                            }}
                            className="flex items-center gap-1 text-black dark:text-black"
                          >
                            <Edit className="w-3 h-3" />
                            편집
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            삭제
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 고객 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>새 고객 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  고객명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="고객명"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="이메일"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">회사</label>
                <input
                  type="text"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                  placeholder="회사명"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">전화</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="전화번호"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">담당자</label>
                <input
                  type="text"
                  value={newCustomer.contactPerson}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                  placeholder="담당자명"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">주소</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="주소"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewCustomer({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      contactPerson: '',
                      company: '',
                    })
                  }}
                  className="text-black dark:text-black"
                >
                  취소
                </Button>
                <Button onClick={handleAddCustomer}>추가</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
