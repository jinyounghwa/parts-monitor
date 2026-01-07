'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { inventoryApi, excelApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Settings,
  Download,
} from 'lucide-react'

export default function InventoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [inventories, setInventories] = useState<any[]>([])
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Modal states
  const [showStockInModal, setShowStockInModal] = useState(false)
  const [showStockOutModal, setShowStockOutModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<any>(null)
  const [stockInData, setStockInData] = useState({ quantity: 0, reference: '', memo: '', performedBy: '' })
  const [stockOutData, setStockOutData] = useState({ quantity: 0, reference: '', memo: '', performedBy: '' })
  const [adjustData, setAdjustData] = useState({ quantity: 0, reason: '' })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [inventoryData, alertsData] = await Promise.all([
          inventoryApi.getInventoryStatus(),
          inventoryApi.getLowStockAlerts(),
        ])

        // If no data from API, use sample data
        if (!inventoryData || inventoryData.length === 0) {
          // 30 Mouser Korea Semiconductor Products distributed across warehouses
          const sampleData = [
            // Microcontrollers (1-10)
            { id: '1', productId: '1', productName: 'ATMEGA328P-AU', manufacturer: 'Microchip Technology', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 120, minimumQuantity: 10, maximumQuantity: 500, location: 'A-01-01', lastUpdated: new Date().toISOString() },
            { id: '2', productId: '1', productName: 'ATMEGA328P-AU', manufacturer: 'Microchip Technology', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 85, minimumQuantity: 10, maximumQuantity: 300, location: 'B-02-03', lastUpdated: new Date().toISOString() },
            { id: '3', productId: '2', productName: 'STM32F103C8T6', manufacturer: 'STMicroelectronics', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 45, minimumQuantity: 5, maximumQuantity: 200, location: 'A-02-02', lastUpdated: new Date().toISOString() },
            { id: '4', productId: '2', productName: 'STM32F103C8T6', manufacturer: 'STMicroelectronics', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 32, minimumQuantity: 5, maximumQuantity: 150, location: 'C-01-04', lastUpdated: new Date().toISOString() },
            { id: '5', productId: '3', productName: 'PIC18F4520', manufacturer: 'Microchip Technology', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 78, minimumQuantity: 8, maximumQuantity: 300, location: 'A-01-05', lastUpdated: new Date().toISOString() },
            { id: '6', productId: '4', productName: 'ATmega2560', manufacturer: 'Microchip Technology', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 52, minimumQuantity: 5, maximumQuantity: 200, location: 'B-03-01', lastUpdated: new Date().toISOString() },
            { id: '7', productId: '5', productName: 'SAMD21J18A', manufacturer: 'Microchip Technology', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 38, minimumQuantity: 5, maximumQuantity: 180, location: 'C-02-02', lastUpdated: new Date().toISOString() },
            { id: '8', productId: '6', productName: 'ESP32-WROOM-32', manufacturer: 'Espressif Systems', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 95, minimumQuantity: 8, maximumQuantity: 250, location: 'A-02-04', lastUpdated: new Date().toISOString() },
            { id: '9', productId: '7', productName: 'NUCLEO-L476RG', manufacturer: 'STMicroelectronics', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 28, minimumQuantity: 3, maximumQuantity: 120, location: 'B-01-02', lastUpdated: new Date().toISOString() },
            { id: '10', productId: '8', productName: 'LPC1769', manufacturer: 'NXP Semiconductors', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 42, minimumQuantity: 5, maximumQuantity: 160, location: 'C-03-01', lastUpdated: new Date().toISOString() },
            { id: '11', productId: '9', productName: 'SAMG55J19', manufacturer: 'Microchip Technology', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 35, minimumQuantity: 4, maximumQuantity: 150, location: 'A-03-03', lastUpdated: new Date().toISOString() },
            { id: '12', productId: '10', productName: 'STM32H743ZI', manufacturer: 'STMicroelectronics', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 25, minimumQuantity: 3, maximumQuantity: 100, location: 'B-04-01', lastUpdated: new Date().toISOString() },

            // Transistors & Diodes (11-15)
            { id: '13', productId: '11', productName: 'BC547A', manufacturer: 'ON Semiconductor', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 450, minimumQuantity: 100, maximumQuantity: 2000, location: 'A-04-02', lastUpdated: new Date().toISOString() },
            { id: '14', productId: '12', productName: '1N4007', manufacturer: 'Rectron', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 320, minimumQuantity: 50, maximumQuantity: 1500, location: 'B-05-01', lastUpdated: new Date().toISOString() },
            { id: '15', productId: '13', productName: '2N7000', manufacturer: 'ON Semiconductor', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 280, minimumQuantity: 50, maximumQuantity: 1200, location: 'C-04-03', lastUpdated: new Date().toISOString() },
            { id: '16', productId: '14', productName: 'IRF540N', manufacturer: 'Infineon', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 185, minimumQuantity: 20, maximumQuantity: 800, location: 'A-05-01', lastUpdated: new Date().toISOString() },
            { id: '17', productId: '15', productName: 'BZX55C5V6', manufacturer: 'ON Semiconductor', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 220, minimumQuantity: 40, maximumQuantity: 1000, location: 'B-06-02', lastUpdated: new Date().toISOString() },

            // Analog ICs (16-20)
            { id: '18', productId: '16', productName: 'NE555P', manufacturer: 'Texas Instruments', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 320, minimumQuantity: 50, maximumQuantity: 1000, location: 'A-03-01', lastUpdated: new Date().toISOString() },
            { id: '19', productId: '17', productName: 'LM7805', manufacturer: 'Texas Instruments', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 280, minimumQuantity: 40, maximumQuantity: 900, location: 'C-05-01', lastUpdated: new Date().toISOString() },
            { id: '20', productId: '18', productName: 'LM386', manufacturer: 'Texas Instruments', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 165, minimumQuantity: 20, maximumQuantity: 600, location: 'A-06-02', lastUpdated: new Date().toISOString() },
            { id: '21', productId: '19', productName: 'TL072', manufacturer: 'Texas Instruments', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 125, minimumQuantity: 15, maximumQuantity: 500, location: 'B-07-01', lastUpdated: new Date().toISOString() },
            { id: '22', productId: '20', productName: 'MAX7219', manufacturer: 'Maxim Integrated', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 92, minimumQuantity: 10, maximumQuantity: 400, location: 'C-06-02', lastUpdated: new Date().toISOString() },

            // Sensors (21-25)
            { id: '23', productId: '21', productName: 'DHT22', manufacturer: 'Aosong Electronics', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 48, minimumQuantity: 5, maximumQuantity: 150, location: 'A-07-01', lastUpdated: new Date().toISOString() },
            { id: '24', productId: '22', productName: 'DS18B20', manufacturer: 'Maxim Integrated', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 156, minimumQuantity: 20, maximumQuantity: 500, location: 'B-08-01', lastUpdated: new Date().toISOString() },
            { id: '25', productId: '23', productName: 'BMP180', manufacturer: 'Bosch Sensortec', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 38, minimumQuantity: 5, maximumQuantity: 120, location: 'C-07-01', lastUpdated: new Date().toISOString() },
            { id: '26', productId: '24', productName: 'MPU6050', manufacturer: 'InvenSense', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 72, minimumQuantity: 10, maximumQuantity: 250, location: 'A-08-02', lastUpdated: new Date().toISOString() },
            { id: '27', productId: '25', productName: 'VL53L0X', manufacturer: 'STMicroelectronics', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 58, minimumQuantity: 8, maximumQuantity: 180, location: 'B-09-01', lastUpdated: new Date().toISOString() },

            // Passive Components (26-30)
            { id: '28', productId: '26', productName: '1206-100nF', manufacturer: 'Samsung', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 2500, minimumQuantity: 300, maximumQuantity: 5000, location: 'A-09-01', lastUpdated: new Date().toISOString() },
            { id: '29', productId: '27', productName: 'RC0805-10K', manufacturer: 'Yageo', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 1850, minimumQuantity: 250, maximumQuantity: 4000, location: 'C-08-01', lastUpdated: new Date().toISOString() },
            { id: '30', productId: '28', productName: 'ELNA-2200uF', manufacturer: 'Elna', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 320, minimumQuantity: 50, maximumQuantity: 1000, location: 'A-10-01', lastUpdated: new Date().toISOString() },
            { id: '31', productId: '29', productName: 'FERRITE-BEAD', manufacturer: 'Würth', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 1200, minimumQuantity: 150, maximumQuantity: 3000, location: 'B-10-01', lastUpdated: new Date().toISOString() },
            { id: '32', productId: '30', productName: 'XL4015', manufacturer: 'Xinlong', warehouseId: '3', warehouseName: '부산 지점', currentQuantity: 95, minimumQuantity: 10, maximumQuantity: 300, location: 'C-09-01', lastUpdated: new Date().toISOString() },
          ]
          const sampleAlerts = [
            {
              id: '1',
              productId: '2',
              productName: 'STM32F103C8T6',
              warehouseName: '경기 센터',
              currentQuantity: 45,
              minimumQuantity: 5,
              variance: 40,
            },
            {
              id: '2',
              productId: '10',
              productName: 'STM32H743ZI',
              warehouseName: '경기 센터',
              currentQuantity: 25,
              minimumQuantity: 3,
              variance: 22,
            },
          ]
          setInventories(sampleData)
          setLowStockAlerts(sampleAlerts)
          return
        }

        setInventories(inventoryData)
        setLowStockAlerts(alertsData || [])
      } catch (err: any) {
        // Use sample data on error
        const sampleData = [
          { id: '1', productId: '1', productName: 'ATMEGA328P-AU', manufacturer: 'Microchip Technology', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 120, minimumQuantity: 10, maximumQuantity: 500, location: 'A-01-01', lastUpdated: new Date().toISOString() },
          { id: '2', productId: '2', productName: 'STM32F103C8T6', manufacturer: 'STMicroelectronics', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 45, minimumQuantity: 5, maximumQuantity: 200, location: 'A-02-02', lastUpdated: new Date().toISOString() },
          { id: '3', productId: '6', productName: 'ESP32-WROOM-32', manufacturer: 'Espressif Systems', warehouseId: '2', warehouseName: '경기 센터', currentQuantity: 95, minimumQuantity: 8, maximumQuantity: 250, location: 'B-02-04', lastUpdated: new Date().toISOString() },
          { id: '4', productId: '11', productName: 'BC547A', manufacturer: 'ON Semiconductor', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 450, minimumQuantity: 100, maximumQuantity: 2000, location: 'A-04-02', lastUpdated: new Date().toISOString() },
          { id: '5', productId: '16', productName: 'NE555P', manufacturer: 'Texas Instruments', warehouseId: '1', warehouseName: '서울 본사', currentQuantity: 320, minimumQuantity: 50, maximumQuantity: 1000, location: 'A-03-01', lastUpdated: new Date().toISOString() },
        ]
        setInventories(sampleData)
        setLowStockAlerts([])
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, authLoading, router, isClient])

  const handleStockIn = async () => {
    if (!selectedInventory) return
    try {
      await inventoryApi.stockIn({
        productId: selectedInventory.productId,
        warehouseId: selectedInventory.warehouseId,
        quantity: stockInData.quantity,
        unitPrice: 0,
        reference: stockInData.reference,
        memo: stockInData.memo,
        performedBy: stockInData.performedBy,
      })
      setShowStockInModal(false)
      // Refresh data
      const data = await inventoryApi.getInventoryStatus()
      setInventories(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStockOut = async () => {
    if (!selectedInventory) return
    try {
      await inventoryApi.stockOut({
        productId: selectedInventory.productId,
        warehouseId: selectedInventory.warehouseId,
        quantity: stockOutData.quantity,
        reference: stockOutData.reference,
        memo: stockOutData.memo,
        performedBy: stockOutData.performedBy,
      })
      setShowStockOutModal(false)
      // Refresh data
      const data = await inventoryApi.getInventoryStatus()
      setInventories(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const openStockInModal = (inventory: any) => {
    setSelectedInventory(inventory)
    setStockInData({ quantity: 0, reference: '', memo: '', performedBy: '' })
    setShowStockInModal(true)
  }

  const openStockOutModal = (inventory: any) => {
    setSelectedInventory(inventory)
    setStockOutData({ quantity: 0, reference: '', memo: '', performedBy: '' })
    setShowStockOutModal(true)
  }

  const openAdjustModal = (inventory: any) => {
    setSelectedInventory(inventory)
    setAdjustData({ quantity: 0, reason: '' })
    setShowAdjustModal(true)
  }

  const handleAdjustStock = async () => {
    if (!selectedInventory) return
    try {
      await inventoryApi.adjustStock({
        productId: selectedInventory.productId,
        warehouseId: selectedInventory.warehouseId,
        quantity: parseInt(adjustData.quantity.toString()),
        reason: adjustData.reason,
      })
      setShowAdjustModal(false)
      // Refresh data
      const data = await inventoryApi.getInventoryStatus()
      setInventories(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleExportInventory = async () => {
    try {
      setExporting(true)
      const blob = await excelApi.exportInventory()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || '재고 내보내기 실패')
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sufficient':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'critical':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sufficient':
        return '충분'
      case 'low':
        return '부족'
      case 'critical':
        return '긴급'
      case 'out_of_stock':
        return '품절'
      default:
        return '미정'
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">{error}</Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">재고 관리</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">전체 재고 현황 및 입출고 관리</p>
          </div>
          <Button
            onClick={handleExportInventory}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2 text-black dark:text-black"
          >
            <Download className="h-4 w-4" />
            {exporting ? '내보내는 중...' : '엑셀 내보내기'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">전체 재고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{inventories.length}</span>
              <Package className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">부족 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{lowStockAlerts.length}</span>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">충분</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {inventories.filter(inv => inv.status === 'sufficient').length}
              </span>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">품절</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {inventories.filter(inv => inv.status === 'out_of_stock').length}
              </span>
              <TrendingDown className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              부족 재고 알림
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.map((alert, idx) => (
                <div
                  key={`alert-${idx}`}
                  className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {alert.product?.partNumber || '미정'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      현재 재고: <span className="font-semibold">{alert.quantity}개</span> / 안전 재고: {alert.safetyStock}개
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(alert.status)}`}>
                    {getStatusLabel(alert.status)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">재고 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">제품</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">창고</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">현재</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">안전</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">재정렬</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">상태</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">작업</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((inventory, idx) => (
                  <tr key={`inv-${idx}`} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {inventory.product?.partNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {inventory.warehouse?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100">
                      {inventory.quantity}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                      {inventory.safetyStock}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                      {inventory.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inventory.status)}`}>
                        {getStatusLabel(inventory.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openStockInModal(inventory)}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                          title="입고"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openStockOutModal(inventory)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="출고"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock In Modal */}
      {showStockInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>입고 처리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제품
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedInventory?.product?.partNumber || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  입고 수량
                </label>
                <input
                  type="number"
                  value={stockInData.quantity}
                  onChange={(e) => setStockInData({ ...stockInData, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  참조번호
                </label>
                <input
                  type="text"
                  value={stockInData.reference}
                  onChange={(e) => setStockInData({ ...stockInData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  placeholder="PO번호 등"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  메모
                </label>
                <textarea
                  value={stockInData.memo}
                  onChange={(e) => setStockInData({ ...stockInData, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowStockInModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleStockIn}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  입고 처리
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Out Modal */}
      {showStockOutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>출고 처리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제품
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedInventory?.product?.partNumber || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  출고 수량
                </label>
                <input
                  type="number"
                  value={stockOutData.quantity}
                  onChange={(e) => setStockOutData({ ...stockOutData, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  참조번호
                </label>
                <input
                  type="text"
                  value={stockOutData.reference}
                  onChange={(e) => setStockOutData({ ...stockOutData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  placeholder="주문번호 등"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  메모
                </label>
                <textarea
                  value={stockOutData.memo}
                  onChange={(e) => setStockOutData({ ...stockOutData, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowStockOutModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleStockOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  출고 처리
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
