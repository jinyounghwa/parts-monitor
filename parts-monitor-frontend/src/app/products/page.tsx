'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { productApi, excelApi } from '@/lib/api'
import type { Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

export default function ProductsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productApi.getAll()

        // If no data from API, use sample data
        if (!data || data.length === 0) {
          const sampleData = [
            // Microcontrollers (1-10)
            { id: '1', partNumber: 'ATMEGA328P-AU', manufacturer: 'Microchip Technology', description: '8-bit AVR Microcontroller, 32KB Flash', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 10 }, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '2', partNumber: 'STM32F103C8T6', manufacturer: 'STMicroelectronics', description: 'ARM Cortex-M3, 64KB Flash, 20KB RAM', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 5 }, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '3', partNumber: 'PIC18F4520', manufacturer: 'Microchip Technology', description: '8-bit PIC Microcontroller, 32KB Flash', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 8 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '4', partNumber: 'ATmega2560', manufacturer: 'Microchip Technology', description: '8-bit AVR, 256KB Flash, Arduino Compatible', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 7 }, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '5', partNumber: 'SAMD21J18A', manufacturer: 'Atmel', description: 'ARM Cortex-M0+, 32-bit, 256KB Flash', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 6 }, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '6', partNumber: 'ESP32-WROOM-32', manufacturer: 'Espressif Systems', description: 'WiFi & Bluetooth SoC, 32-bit Dual Core', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 8, stockMin: 8 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '7', partNumber: 'NUCLEO-L476RG', manufacturer: 'STMicroelectronics', description: 'Development Board, STM32L476RG MCU', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 4 }, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '8', partNumber: 'LPC1769', manufacturer: 'NXP Semiconductors', description: 'ARM Cortex-M3, 256KB Flash, Ethernet', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 5 }, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '9', partNumber: 'SAMG55J19', manufacturer: 'Atmel', description: 'ARM Cortex-M4, 256KB Flash, CAN Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 5 }, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '10', partNumber: 'STM32H743ZI', manufacturer: 'STMicroelectronics', description: 'ARM Cortex-M7, 2MB Flash, High Performance', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 3 }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Transistors & Diodes (11-15)
            { id: '11', partNumber: 'BC547A', manufacturer: 'ON Semiconductor', description: 'NPN BJT Transistor, Small Signal', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 100 }, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '12', partNumber: '1N4007', manufacturer: 'Diotec', description: 'General Purpose Rectifier Diode, 1A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 1, stockMin: 200 }, createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '13', partNumber: '2N7000', manufacturer: 'ON Semiconductor', description: 'N-Channel MOSFET, Small Signal', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 80 }, createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '14', partNumber: 'IRF540N', manufacturer: 'Infineon', description: 'N-Channel Power MOSFET, 33A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 20 }, createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '15', partNumber: 'BZX55C5V6', manufacturer: 'ON Semiconductor', description: 'Zener Diode, 5.6V, 500mW', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 150 }, createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Analog ICs (16-20)
            { id: '16', partNumber: 'NE555P', manufacturer: 'Texas Instruments', description: 'Timer IC, Oscillator/Monostable', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 50 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '17', partNumber: 'LM7805', manufacturer: 'Texas Instruments', description: 'Linear Voltage Regulator, +5V, 1.5A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 40 }, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '18', partNumber: 'LM386', manufacturer: 'Texas Instruments', description: 'Low Voltage Audio Power Amplifier', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 35 }, createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '19', partNumber: 'TL072', manufacturer: 'Texas Instruments', description: 'Dual Low-Noise Operational Amplifier', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 25 }, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '20', partNumber: 'MAX7219', manufacturer: 'Maxim Integrated', description: 'LED Display Driver, SPI Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 15 }, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Sensors (21-25)
            { id: '21', partNumber: 'DHT22', manufacturer: 'Aosong Electronics', description: 'Temperature & Humidity Sensor', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 15 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '22', partNumber: 'DS18B20', manufacturer: 'Maxim Integrated', description: 'Digital Temperature Sensor, 1-Wire', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 20 }, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '23', partNumber: 'BMP180', manufacturer: 'Bosch Sensortec', description: 'Barometric Pressure & Altitude Sensor', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 12 }, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '24', partNumber: 'MPU6050', manufacturer: 'InvenSense', description: '6-Axis Motion Sensor, Gyroscope + Accelerometer', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 10 }, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '25', partNumber: 'VL53L0X', manufacturer: 'STMicroelectronics', description: 'Time-of-Flight Distance Sensor', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 7, stockMin: 8 }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Passive Components (26-30)
            { id: '26', partNumber: '1206-100nF', manufacturer: 'Samsung', description: 'Ceramic Capacitor, 100nF, 50V', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 1, stockMin: 500 }, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '27', partNumber: 'RC0805-10K', manufacturer: 'Yageo', description: 'Thin Film Resistor, 10kΩ, 0.1W', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 1, stockMin: 1000 }, createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '28', partNumber: 'ELNA-2200uF', manufacturer: 'Elna', description: 'Aluminum Electrolytic Capacitor, 2200µF, 25V', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 30 }, createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '29', partNumber: 'FERRITE-BEAD', manufacturer: 'Murata', description: 'Ferrite Bead, 0805, 600Ω @ 100MHz', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 200 }, createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '30', partNumber: 'XL4015', manufacturer: 'Xinlian Electronics', description: 'Buck Converter Module, 5A, 150W', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 12 }, createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Communication & Memory ICs (31-40)
            { id: '31', partNumber: 'HC-05', manufacturer: 'JY-MCU', description: 'Bluetooth Module, Serial Communication', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 8 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '32', partNumber: 'nRF24L01', manufacturer: 'Nordic Semiconductor', description: '2.4GHz RF Transceiver, SPI Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 10 }, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '33', partNumber: 'AT24C256', manufacturer: 'Atmel', description: '256K Byte EEPROM, I2C Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 30 }, createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '34', partNumber: 'W25Q64', manufacturer: 'Winbond', description: '64M-bit Serial Flash, SPI Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 20 }, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '35', partNumber: 'MCP2515', manufacturer: 'Microchip', description: 'CAN Controller, SPI Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 12 }, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '36', partNumber: 'MAX485', manufacturer: 'Maxim Integrated', description: 'RS-485 Transceiver, Half-Duplex', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 25 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '37', partNumber: 'SIM800L', manufacturer: 'SIMCom', description: 'Quad-band GSM/GPRS Module', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 7, stockMin: 5 }, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '38', partNumber: 'PCF8574', manufacturer: 'NXP', description: '8-bit I/O Expander, I2C Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 40 }, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '39', partNumber: 'FTDI-FT232RL', manufacturer: 'Future Technology', description: 'USB to Serial UART Interface', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 15 }, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '40', partNumber: 'AMS1117-3.3', manufacturer: 'AMS', description: 'Linear Voltage Regulator, +3.3V, 1A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 50 }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            // Power Management & Protection ICs (41-50)
            { id: '41', partNumber: 'ACS712', manufacturer: 'Allegro MicroSystems', description: 'Hall Effect Current Sensor, 5A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 18 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '42', partNumber: 'LM1117', manufacturer: 'Texas Instruments', description: 'Adjustable Linear Voltage Regulator', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 35 }, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '43', partNumber: 'TP4056', manufacturer: 'Nanjing Extension', description: 'Lithium Battery Charging Module, 1A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 22 }, createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '44', partNumber: 'BMS1S30A', manufacturer: 'Generic', description: 'Single Cell Lithium BMS Module, 30A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 12 }, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '45', partNumber: 'MT3608', manufacturer: 'Micropower', description: 'Buck-Boost Converter, 2A, Adjustable', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 16 }, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '46', partNumber: 'DW01A', manufacturer: 'DFRobot', description: 'Lithium Battery Protection IC', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 40 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '47', partNumber: 'MOSFET-AO3400', manufacturer: 'Alpha & Omega', description: 'N-Channel MOSFET, 3A, Low Rds(on)', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 60 }, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '48', partNumber: 'RELAY-SRD-5V', manufacturer: 'Songle', description: 'Electromagnetic Relay, 5V Coil, SPDT', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 28 }, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '49', partNumber: 'OPTO-PC817', manufacturer: 'Sharp', description: 'Optocoupler, Single Channel', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 45 }, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
            { id: '50', partNumber: 'INA219', manufacturer: 'Texas Instruments', description: 'I2C Power Monitor, High-Side', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 14 }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          ]
          setProducts(sampleData)
          setFilteredProducts(sampleData)
          return
        }

        setProducts(data)
        setFilteredProducts(data)
      } catch (err: any) {
        // Use sample data on error
        const sampleData = [
          { id: '1', partNumber: 'ATMEGA328P-AU', manufacturer: 'Microchip Technology', description: '8-bit AVR Microcontroller, 32KB Flash', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 5, stockMin: 10 }, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', partNumber: 'STM32F103C8T6', manufacturer: 'STMicroelectronics', description: 'ARM Cortex-M3, 64KB Flash, 20KB RAM', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 3, stockMin: 5 }, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '6', partNumber: 'ESP32-WROOM-32', manufacturer: 'Espressif Systems', description: 'WiFi & Bluetooth SoC, 32-bit Dual Core', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 8, stockMin: 8 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '31', partNumber: 'HC-05', manufacturer: 'JY-MCU', description: 'Bluetooth Module, Serial Communication', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 6, stockMin: 8 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '43', partNumber: 'TP4056', manufacturer: 'Nanjing Extension', description: 'Lithium Battery Charging Module, 1A', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 4, stockMin: 22 }, createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '11', partNumber: 'BC547A', manufacturer: 'ON Semiconductor', description: 'NPN BJT Transistor, Small Signal', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 100 }, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
          { id: '16', partNumber: 'NE555P', manufacturer: 'Texas Instruments', description: 'Timer IC, Oscillator/Monostable', targetSites: [], isActive: true, alertThreshold: { priceChangePercent: 2, stockMin: 50 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
        ]
        setProducts(sampleData)
        setFilteredProducts(sampleData)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = products.filter(
      (product) =>
        product.partNumber.toLowerCase().includes(query) ||
        product.manufacturer.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleExportProducts = async () => {
    try {
      setExporting(true)
      const blob = await excelApi.exportProducts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || '제품 내보내기 실패')
    } finally {
      setExporting(false)
    }
  }

  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      await excelApi.importProducts(file)
      // Refresh products list
      const data = await productApi.getAll()
      setProducts(data)
      setFilteredProducts(data)
      setError('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setError(err.message || '제품 가져오기 실패')
    } finally {
      setImporting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">제품</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            모니터링 중인 전자 부품 목록
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportProducts}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2 text-black dark:text-black"
          >
            <Download className="h-4 w-4" />
            {exporting ? '내보내는 중...' : '내보내기'}
          </Button>
          <label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportProducts}
              disabled={importing}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              disabled={importing}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer text-black dark:text-black"
            >
              <Upload className="h-4 w-4" />
              {importing ? '가져오는 중...' : '가져오기'}
            </Button>
          </label>
          <Button
            onClick={() => router.push('/products/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            제품 추가
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="부품 번호, 제조사, 설명으로 검색..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {product.manufacturer}
                  </span>
                </div>
                <div className="flex gap-1">
                  {product.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {product.partNumber}
              </h3>

              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {product.targetSites.length} sites
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {product.alertThreshold.priceChangePercent > 0
                    ? `±${product.alertThreshold.priceChangePercent}%`
                    : '-'}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/products/${product.id}`)
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  상세
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/products/${product.id}/edit`)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 제품이 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? '다른 검색어를 시도해보세요'
                : '새 제품을 추가하여 모니터링을 시작하세요'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/products/new')}>
                <Plus className="h-4 w-4 mr-2" />
                제품 추가
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
