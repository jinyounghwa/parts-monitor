import axios, { AxiosError } from 'axios'
import type {
  User,
  Product,
  PriceHistory,
  DashboardStats,
  PriceAlert,
  StockAlert,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/profile')
    return response.data
  },

  createUser: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/api/auth/users', data)
    return response.data
  },
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products')
    return response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/api/products/${id}`)
    return response.data
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>('/api/products', data)
    return response.data
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/api/products/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`)
  },

  getHistory: async (id: string, days = 30): Promise<PriceHistory[]> => {
    const response = await api.get<PriceHistory[]>(
      `/api/products/${id}/history?days=${days}`
    )
    return response.data
  },

  getActive: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products?isActive=true')
    return response.data
  },
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/dashboard/stats')
    return response.data
  },

  getProductPriceHistory: async (
    productId: string,
    days = 30
  ): Promise<{ productId: string; data: any[] }> => {
    const response = await api.get(
      `/api/dashboard/price-history/${productId}?days=${days}`
    )
    return response.data
  },

  getAllPriceHistories: async (
    days = 30
  ): Promise<Array<{ product: Product; data: any[] }>> => {
    const response = await api.get(`/api/dashboard/price-histories?days=${days}`)
    return response.data
  },

  getAlerts: async (limit = 10): Promise<{
    priceAlerts: PriceAlert[]
    stockAlerts: StockAlert[]
  }> => {
    const response = await api.get(`/api/dashboard/alerts?limit=${limit}`)
    return response.data
  },

  exportData: async (days = 30): Promise<{
    filename: string
    data: any[]
  }> => {
    const response = await api.get(`/api/dashboard/export?days=${days}`)
    return response.data
  },
}

export const scraperApi = {
  runManualScrape: async (productId: string): Promise<{ jobId: number; message: string }> => {
    const response = await api.post<{ jobId: number; message: string }>(
      '/api/scraper/run',
      { productId }
    )
    return response.data
  },

  runBatchScrape: async (productIds: string[]): Promise<{ jobId: number; message: string }> => {
    const response = await api.post<{ jobId: number; message: string }>(
      '/api/scraper/run-batch',
      { productIds }
    )
    return response.data
  },

  runSingleScrape: async (productId: string, site: string, url: string): Promise<any> => {
    const response = await api.post<any>(
      '/api/scraper/run-single',
      { productId, site, url }
    )
    return response.data
  },

  getJobStatus: async (jobId: string): Promise<any> => {
    const response = await api.get<any>(`/api/scraper/job/${jobId}`)
    return response.data
  },

  getSupportedSites: async (): Promise<any> => {
    const response = await api.get<any>('/api/scraper/supported-sites')
    return response.data
  },

  getScrapingStatus: async (): Promise<any> => {
    const response = await api.get<any>('/api/queue/scraping')
    return response.data
  },

  getProductHistory: async (productId: string, limit = 20): Promise<any[]> => {
    const response = await api.get<any[]>(`/api/products/${productId}/history?limit=${limit}`)
    return response.data
  },

  getScrapingStats: async (productId?: string): Promise<any> => {
    const url = productId
      ? `/api/products/history/stats?productId=${productId}`
      : '/api/products/history/stats'
    const response = await api.get<any>(url)
    return response.data
  },
}

export const queueApi = {
  getQueues: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/queue')
    return response.data
  },

  deleteQueue: async (queueName: string): Promise<void> => {
    await api.delete(`/api/queue/${queueName}`)
  },

  createJob: async (queueName: string, data: any): Promise<any> => {
    const response = await api.post<any>(`/api/queue/${queueName}/add`, data)
    return response.data
  },
}

export const notificationApi = {
  sendDailyReport: async (recipients: string[], reportData: any): Promise<any> => {
    const response = await api.post<any>('/api/notification/daily-report', {
      recipients,
      reportData,
    })
    return response.data
  },

  sendPriceAlert: async (recipients: string[], alertData: any): Promise<any> => {
    const response = await api.post<any>('/api/notification/price-alert', {
      recipients,
      alertData,
    })
    return response.data
  },

  sendStockAlert: async (recipients: string[], alertData: any): Promise<any> => {
    const response = await api.post<any>('/api/notification/stock-alert', {
      recipients,
      alertData,
    })
    return response.data
  },

  sendLowStockAlert: async (recipients: string[], inventories: any[]): Promise<any> => {
    const response = await api.post<any>('/api/notification/low-stock-alert', {
      recipients,
      inventories,
    })
    return response.data
  },
}

export const inventoryApi = {
  getInventoryStatus: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/inventory')
    return response.data
  },

  getProductInventory: async (productId: string, warehouseId?: string): Promise<any> => {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : ''
    const response = await api.get<any>(`/api/inventory/${productId}${params}`)
    return response.data
  },

  stockIn: async (data: any): Promise<any> => {
    const response = await api.post<any>('/api/inventory/stock-in', data)
    return response.data
  },

  stockOut: async (data: any): Promise<any> => {
    const response = await api.post<any>('/api/inventory/stock-out', data)
    return response.data
  },

  adjustStock: async (data: any): Promise<any> => {
    const response = await api.post<any>('/api/inventory/adjust', data)
    return response.data
  },

  getTransactionHistory: async (productId: string, limit?: number): Promise<any[]> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get<any[]>(`/api/inventory/${productId}/transactions${params}`)
    return response.data
  },

  getLowStockAlerts: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/inventory/alerts/low-stock')
    return response.data
  },

  updateSafetyStock: async (productId: string, data: any): Promise<any> => {
    const response = await api.patch<any>(`/api/inventory/${productId}/safety-stock`, data)
    return response.data
  },
}

export const quotationApi = {
  getAll: async (limit?: number, offset?: number): Promise<any[]> => {
    let url = '/quotations'
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    if (params.toString()) url += `?${params.toString()}`
    const response = await api.get<any[]>(url)
    return response.data
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/quotations/${id}`)
    return response.data
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post<any>('/quotations', data)
    return response.data
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.patch<any>(`/quotations/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quotations/${id}`)
  },

  getPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/quotations/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  sendEmail: async (id: string, recipients: string[]): Promise<any> => {
    const response = await api.post<any>(`/quotations/${id}/send-email`, { recipients })
    return response.data
  },

  updateStatus: async (id: string, status: string): Promise<any> => {
    const response = await api.patch<any>(`/quotations/${id}/status`, { status })
    return response.data
  },

  reserveStock: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/quotations/${id}/reserve-stock`)
    return response.data
  },

  releaseStock: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/quotations/${id}/release-stock`)
    return response.data
  },

  checkStockAvailability: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/quotations/${id}/stock-availability`)
    return response.data
  },
}

export const warehouseApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/warehouses')
    return response.data
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/warehouses/${id}`)
    return response.data
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post<any>('/warehouses', data)
    return response.data
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.patch<any>(`/warehouses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`)
  },

  getProducts: async (id: string, status?: string, page?: number, limit?: number): Promise<any> => {
    let url = `/warehouses/${id}/products`
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    const response = await api.get<any>(url)
    return response.data
  },

  getSummary: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/warehouses/${id}/summary`)
    return response.data
  },

  searchProducts: async (id: string, query: string): Promise<any> => {
    const response = await api.get<any>(`/warehouses/${id}/search?query=${query}`)
    return response.data
  },
}

export const customerApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/customers')
    return response.data
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/customers/${id}`)
    return response.data
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post<any>('/customers', data)
    return response.data
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.patch<any>(`/customers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`)
  },
}

export const excelApi = {
  importProducts: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<any>('/excel/import/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  exportInventory: async (): Promise<Blob> => {
    const response = await api.get('/excel/export/inventory', {
      responseType: 'blob',
    })
    return response.data
  },

  exportProducts: async (): Promise<Blob> => {
    const response = await api.get('/excel/export/products', {
      responseType: 'blob',
    })
    return response.data
  },
}

export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get<{ status: string; timestamp: string }>('/api/health')
    return response.data
  },
}

export default api
