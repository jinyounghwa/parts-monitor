import { useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface ProductRefreshButtonProps {
  productId: string
  productName: string
  onRefreshComplete?: (result: any) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'icon'
  className?: string
}

export function ProductRefreshButton({
  productId,
  productName,
  onRefreshComplete,
  size = 'md',
  variant = 'primary',
  className = '',
}: ProductRefreshButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch refresh history for this product
  const { data: history } = useQuery({
    queryKey: ['product-refresh-history', productId],
    queryFn: () => api.get(`/api/products/${productId}/history`).then((res) => res.data),
    enabled: false, // Load only when needed
  })

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () =>
      api.post(`/api/products/${productId}/refresh`).then((res) => res.data),
    onSuccess: (data) => {
      onRefreshComplete?.(data)
      setIsAnimating(false)
    },
    onError: () => {
      setIsAnimating(false)
    },
  })

  const handleRefresh = () => {
    setIsAnimating(true)
    refreshMutation.mutate()
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Variant classes
  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors',
    icon: 'p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600',
  }

  // Get most recent refresh status
  const lastRefresh = history?.[0]
  const getStatusIcon = () => {
    if (!lastRefresh) return null
    if (lastRefresh.success) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (!lastRefresh.success) return <XCircle className="w-4 h-4 text-red-500" />
    return <Clock className="w-4 h-4 text-yellow-500" />
  }

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending || isAnimating}
          className={`${variantClasses.icon} ${
            refreshMutation.isPending || isAnimating ? 'animate-spin' : ''
          }`}
          title="갱신하기"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        {lastRefresh && (
          <div className="absolute -top-1 -right-1" title="최근 갱신 상태">
            {getStatusIcon()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleRefresh}
        disabled={refreshMutation.isPending || isAnimating}
        className={`${sizeClasses[size]} ${variantClasses[variant]} ${
          refreshMutation.isPending || isAnimating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <RefreshCw
          className={`w-4 h-4 mr-2 ${
            refreshMutation.isPending || isAnimating ? 'animate-spin' : ''
          }`}
        />
        정보 갱신
      </button>

      {/* Last refresh status indicator */}
      {lastRefresh && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          {getStatusIcon()}
          <span className="text-gray-500">
            {new Date(lastRefresh.scrapedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {refreshMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>갱신 중...</span>
        </div>
      )}
    </div>
  )
}
