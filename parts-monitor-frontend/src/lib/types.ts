export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export interface TargetSite {
  name: string
  url: string
  isActive: boolean
}

export interface AlertThreshold {
  priceChangePercent: number
  stockMin: number
  emailRecipients?: string[]
}

export interface Product {
  id: string
  partNumber: string
  manufacturer: string
  description: string
  targetSites: TargetSite[]
  alertThreshold: AlertThreshold
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PriceHistory {
  id: string
  productId: string
  site: string
  scrapedAt: string
  stockQuantity: number
  prices: PricePoint[]
  priceChange: number
}

export interface PricePoint {
  quantity: number
  unitPrice: number
  currency: string
}

export interface MonitoringJob {
  id: string
  productIds: string[]
  schedule: string
  emailRecipients: string[]
  lastRunAt: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export interface DashboardStats {
  totalProducts: number
  lastScrapeAt: string | null
  significantPriceChanges: number
  lowStockAlerts: number
}

export interface PriceAlert {
  type: 'price'
  product: string
  site: string
  change: number
  date: string
}

export interface StockAlert {
  type: 'stock'
  product: string
  site: string
  quantity: number
  date: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
}
