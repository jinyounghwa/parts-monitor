'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { productApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import { Product } from '@/lib/types'

interface TargetSiteInput {
  name: string
  url: string
  isActive: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = (params?.id as string) || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    partNumber: '',
    manufacturer: '',
    description: '',
    targetSites: [] as TargetSiteInput[],
    alertThreshold: {
      priceChangePercent: 5,
      stockMin: 10,
    },
    isActive: true,
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const product = await productApi.getById(productId)
        setFormData({
          partNumber: product.partNumber,
          manufacturer: product.manufacturer,
          description: product.description || '',
          targetSites: product.targetSites,
          alertThreshold: {
            priceChangePercent: product.alertThreshold.priceChangePercent,
            stockMin: product.alertThreshold.stockMin,
          },
          isActive: product.isActive,
        })
      } catch (err: any) {
        setError(err.message || '제품 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith('threshold.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        alertThreshold: {
          ...prev.alertThreshold,
          [field]: Number(value),
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSiteChange = (index: number, field: keyof TargetSiteInput, value: string) => {
    setFormData((prev) => {
      const newSites = [...prev.targetSites]
      newSites[index] = { ...newSites[index], [field]: value }
      return { ...prev, targetSites: newSites }
    })
  }

  const addSite = () => {
    setFormData((prev) => ({
      ...prev,
      targetSites: [...prev.targetSites, { name: '', url: '', isActive: true }],
    }))
  }

  const removeSite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      targetSites: prev.targetSites.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.partNumber || !formData.manufacturer) {
      setError('부품 번호와 제조사는 필수입니다.')
      return
    }

    const validSites = formData.targetSites.filter(site => site.name && site.url)
    if (validSites.length === 0) {
      setError('최소 하나의 유효한 대상 사이트가 필요합니다.')
      return
    }

    try {
      setSaving(true)
      await productApi.update(productId, {
        ...formData,
        targetSites: validSites,
      })
      router.push(`/products/${productId}`)
    } catch (err: any) {
      setError(err.message || '제품 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/products/${productId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          돌아가기
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">제품 수정</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부품 번호 <span className="text-red-500">*</span>
              </label>
              <Input
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제조사 <span className="text-red-500">*</span>
              </label>
              <Input
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>모니터링 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 변동 알림 (%)
                </label>
                <Input
                  type="number"
                  name="threshold.priceChangePercent"
                  value={formData.alertThreshold.priceChangePercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 재고 알림 (개)
                </label>
                <Input
                  type="number"
                  name="threshold.stockMin"
                  value={formData.alertThreshold.stockMin}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>대상 사이트</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSite}
            >
              <Plus className="h-4 w-4 mr-1" />
              사이트 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.targetSites.map((site, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사이트 이름
                    </label>
                    <Input
                      value={site.name}
                      onChange={(e) => handleSiteChange(index, 'name', e.target.value)}
                      placeholder="예: Digikey"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <Input
                      value={site.url}
                      onChange={(e) => handleSiteChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {formData.targetSites.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeSite(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6">
            <Alert variant="destructive">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/products/${productId}`)}
          >
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loading size="sm" /> : <Save className="h-4 w-4 mr-2" />}
            수정 완료
          </Button>
        </div>
      </form>
    </div>
  )
}
