import { test, expect } from '@playwright/test';

let authToken: string;
let productId: string;
let warehouseId: string;

test.describe('Inventory API', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'TestPassword123!',
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.access_token;

    // Create test product
    const productResponse = await request.post('http://localhost:3000/api/products', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        partNumber: 'INV-TEST-001',
        partName: 'Test Product for Inventory',
        manufacturer: 'Test Manufacturer',
        standardPrice: 1000,
        unit: 'EA',
        targetSites: [],
        alertThreshold: { priceChangePercent: 10, stockMin: 10 },
      },
    });
    const productData = await productResponse.json();
    productId = productData.id;

    // Create test warehouse
    const warehouseResponse = await request.post('http://localhost:3000/warehouses', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        code: 'TEST-WH',
        name: 'Test Warehouse',
      },
    });
    const warehouseData = await warehouseResponse.json();
    warehouseId = warehouseData.id;

    // Initialize inventory
    await request.post('http://localhost:3000/inventory/adjust', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        productId,
        warehouseId,
        newQuantity: 50,
        performedBy: 'testuser',
      },
    });
  });

  test('GET /inventory - Get all inventory status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/inventory', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /inventory/:productId - Get specific inventory', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/inventory/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.productId).toBe(productId);
    expect(data.quantity).toBe(50);
  });

  test('POST /inventory/stock-in - Stock in operation', async ({ request }) => {
    const response = await request.post('http://localhost:3000/inventory/stock-in', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        productId,
        warehouseId,
        quantity: 20,
        unitPrice: 900,
        reference: 'PO-TEST-001',
        performedBy: 'testuser',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.inventory.quantity).toBe(70);
    expect(data.transaction.type).toBe('IN');
  });

  test('POST /inventory/stock-out - Stock out operation', async ({ request }) => {
    const response = await request.post('http://localhost:3000/inventory/stock-out', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        productId,
        warehouseId,
        quantity: 15,
        reference: 'SO-TEST-001',
        performedBy: 'testuser',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.inventory.quantity).toBe(55);
    expect(data.transaction.type).toBe('OUT');
  });

  test('POST /inventory/adjust - Adjust stock quantity', async ({ request }) => {
    const response = await request.post('http://localhost:3000/inventory/adjust', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        productId,
        warehouseId,
        newQuantity: 100,
        memo: 'Inventory adjustment',
        performedBy: 'testuser',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.inventory.quantity).toBe(100);
    expect(data.transaction.type).toBe('ADJUST');
  });

  test('GET /inventory/:productId/transactions - Get transaction history', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/inventory/${productId}/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('type');
    expect(data[0]).toHaveProperty('quantity');
    expect(data[0]).toHaveProperty('beforeQuantity');
    expect(data[0]).toHaveProperty('afterQuantity');
  });

  test('GET /inventory/alerts/low-stock - Get low stock alerts', async ({ request }) => {
    const response = await request.get('http://localhost:3000/inventory/alerts/low-stock', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('PATCH /inventory/:productId/safety-stock - Update safety stock', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/inventory/${productId}/safety-stock`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        warehouseId,
        safetyStock: 20,
        reorderPoint: 10,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.safetyStock).toBe(20);
    expect(data.reorderPoint).toBe(10);
  });

  test('POST /inventory/stock-out - Fail with insufficient stock', async ({ request }) => {
    const response = await request.post('http://localhost:3000/inventory/stock-out', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        productId,
        warehouseId,
        quantity: 1000,
      },
    });

    expect(response.status()).toBe(400);
  });
});
