import { test, expect } from '@playwright/test';

let authToken: string;
let productId: string;

test.describe('Products API', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'TestPassword123!',
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.access_token;
  });

  test('POST /api/products - Create new product', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/products', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        partNumber: 'RES-001',
        partName: 'Resistor 10k Ohm',
        manufacturer: 'Samsung',
        category: 'Resistors',
        specification: '1/4W, 5%',
        standardPrice: 100,
        purchasePrice: 80,
        unit: 'EA',
        targetSites: [],
        alertThreshold: {
          priceChangePercent: 10,
          stockMin: 100,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.partNumber).toBe('RES-001');
    expect(data.partName).toBe('Resistor 10k Ohm');
    productId = data.id;
  });

  test('GET /api/products - Get all products', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/products', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/products/:id - Get single product', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(productId);
    expect(data.partNumber).toBe('RES-001');
  });

  test('PATCH /api/products/:id - Update product', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        standardPrice: 120,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.standardPrice).toBe(120);
  });

  test('DELETE /api/products/:id - Delete product', async ({ request }) => {
    const response = await request.delete(`http://localhost:3000/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(204);
  });
});
