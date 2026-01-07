'use client'

import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { Plus, Trash2, Edit, Lock } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Ideally this would call an API to get users, but we'll show a placeholder
      setUsers([])
    } catch (err: any) {
      setError(err.message || '사용자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      setError('모든 필드는 필수입니다')
      return
    }
    try {
      await authApi.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
      })
      setShowCreateModal(false)
      setNewUser({ email: '', name: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">관리자 패널</h1>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          사용자 추가
        </Button>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">일반 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.role === 'user').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 관리</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>등록된 사용자가 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">이메일</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">이름</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">역할</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">생성일</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.email}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? '관리자' : '일반'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            편집
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
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
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">백업 및 복구</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="text-black dark:text-black">데이터 백업</Button>
              <Button variant="outline" className="text-black dark:text-black">데이터 복구</Button>
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">캐시 관리</h3>
            <Button variant="outline" className="text-black dark:text-black">캐시 초기화</Button>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">시스템 정보</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>버전: 1.0.0</p>
              <p>데이터베이스: PostgreSQL</p>
              <p>마지막 업데이트: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>새 사용자 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">역할</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                >
                  <option value="user">일반 사용자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewUser({ email: '', name: '', password: '', role: 'user' })
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleCreateUser}>추가</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
