import { DataSource } from 'typeorm';
import { Product } from '../modules/product/entities/product.entity';
import { Inventory } from '../modules/inventory/entities/inventory.entity';
import { Warehouse } from '../modules/warehouse/entities/warehouse.entity';

export async function seedDatabase(dataSource: DataSource) {
  const productRepo = dataSource.getRepository(Product);
  const inventoryRepo = dataSource.getRepository(Inventory);
  const warehouseRepo = dataSource.getRepository(Warehouse);

  // Check if data already exists
  const existingProducts = await productRepo.count();
  if (existingProducts > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('Seeding database with Mouser electronics...');

  // Create warehouses
  const warehouse1 = warehouseRepo.create({
    code: 'WH-001',
    name: '서울 본사 창고',
    address: '서울시 강남구',
    manager: '이창호',
    phone: '02-1234-5678',
    isActive: true,
  });

  const warehouse2 = warehouseRepo.create({
    code: 'WH-002',
    name: '부산 물류센터',
    address: '부산시 부산진구',
    manager: '박준호',
    phone: '051-9876-5432',
    isActive: true,
  });

  await warehouseRepo.save([warehouse1, warehouse2]);

  // Create products based on Mouser popular items
  const products = [
    {
      partNumber: 'ATMEGA328P-AU',
      partName: 'ATmega328P AVR Microcontroller',
      manufacturer: 'Microchip',
      category: 'Microcontrollers',
      specification: 'TQFP-32, 8-bit, 16MHz, 32KB Flash',
      standardPrice: 3500,
      purchasePrice: 2800,
      unit: 'EA',
      description: 'Arduino용 고성능 마이크로컨트롤러',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
        { name: 'digikey', url: 'https://www.digikey.com', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 5, stockMin: 50, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'STM32F103C8T6',
      partName: 'STM32F1 ARM Microcontroller',
      manufacturer: 'STMicroelectronics',
      category: 'Microcontrollers',
      specification: 'LQFP-48, 32-bit, 72MHz, 64KB Flash',
      standardPrice: 5200,
      purchasePrice: 4100,
      unit: 'EA',
      description: '고성능 ARM Cortex-M3 MCU',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
        { name: 'danawa', url: 'https://www.danawa.com', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 5, stockMin: 40, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'ESP32-WROOM-32',
      partName: 'ESP32 WiFi Bluetooth Module',
      manufacturer: 'Espressif',
      category: 'Wireless Modules',
      specification: 'Dual-core, 240MHz, 4MB Flash',
      standardPrice: 8900,
      purchasePrice: 6800,
      unit: 'EA',
      description: 'WiFi/Bluetooth 통합 모듈',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 5, stockMin: 30, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'LM7805CT',
      partName: 'Linear Voltage Regulator 5V',
      manufacturer: 'Texas Instruments',
      category: 'Power Management',
      specification: 'TO-220, 5V/1.5A',
      standardPrice: 800,
      purchasePrice: 500,
      unit: 'EA',
      description: '5V 선형 레귤레이터',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
        { name: 'digikey', url: 'https://www.digikey.com', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 3, stockMin: 100, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'NE555P',
      partName: '555 Timer IC',
      manufacturer: 'Texas Instruments',
      category: 'Analog ICs',
      specification: 'DIP-8, Precision Timer',
      standardPrice: 900,
      purchasePrice: 600,
      unit: 'EA',
      description: '다목적 타이머 IC',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 3, stockMin: 80, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'BC547A',
      partName: 'NPN Transistor',
      manufacturer: 'ON Semiconductor',
      category: 'Discrete Semiconductors',
      specification: 'TO-92, hFE=200-450',
      standardPrice: 200,
      purchasePrice: 100,
      unit: 'EA',
      description: '일반용 NPN 트랜지스터',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 2, stockMin: 200, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: '1N4007',
      partName: 'Rectifier Diode',
      manufacturer: 'ON Semiconductor',
      category: 'Discrete Semiconductors',
      specification: 'DO-41, 1000V/1A',
      standardPrice: 150,
      purchasePrice: 80,
      unit: 'EA',
      description: '범용 정류 다이오드',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 2, stockMin: 300, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'DHT22',
      partName: 'Digital Temperature & Humidity Sensor',
      manufacturer: 'Aosong',
      category: 'Sensors',
      specification: 'AM2302, ±0.5°C',
      standardPrice: 4500,
      purchasePrice: 3200,
      unit: 'EA',
      description: '디지털 온습도 센서',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 5, stockMin: 25, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: 'HC-SR04',
      partName: 'Ultrasonic Distance Sensor',
      manufacturer: 'Elec Freaks',
      category: 'Sensors',
      specification: '2cm-4m, ±3mm',
      standardPrice: 5500,
      purchasePrice: 4000,
      unit: 'EA',
      description: '초음파 거리 측정 센서',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 5, stockMin: 20, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
    {
      partNumber: '16x2-LCD',
      partName: '16x2 Character LCD Display',
      manufacturer: 'Various',
      category: 'Displays',
      specification: '16 columns x 2 rows',
      standardPrice: 3000,
      purchasePrice: 2000,
      unit: 'EA',
      description: '16문자 2줄 LCD 디스플레이',
      targetSites: [
        { name: 'mouser', url: 'https://www.mouser.kr', isActive: true },
      ],
      alertThreshold: { priceChangePercent: 4, stockMin: 20, emailRecipients: ['admin@test.com'] },
      isActive: true,
    },
  ];

  const savedProducts = await productRepo.save(
    products.map(p =>
      productRepo.create({
        ...p,
        targetSites: p.targetSites,
        alertThreshold: p.alertThreshold,
      })
    )
  );

  console.log(`Created ${savedProducts.length} products`);

  // Create inventory records
  const inventoryData = [];
  for (const product of savedProducts) {
    // Add to both warehouses
    inventoryData.push(
      inventoryRepo.create({
        product,
        warehouse: warehouse1,
        quantity: Math.floor(Math.random() * 200) + 50,
        safetyStock: 30,
        reorderPoint: 15,
        location: `A-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`,
      }),
      inventoryRepo.create({
        product,
        warehouse: warehouse2,
        quantity: Math.floor(Math.random() * 150) + 30,
        safetyStock: 25,
        reorderPoint: 10,
        location: `B-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`,
      })
    );
  }

  await inventoryRepo.save(inventoryData);
  console.log(`Created ${inventoryData.length} inventory records`);
  console.log('Database seeding completed!');
}
