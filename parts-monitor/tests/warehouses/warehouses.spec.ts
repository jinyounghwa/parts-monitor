import { test, expect } from '@playwright/test';

let authToken: string;
let warehouseId: string;

test.describe('Warehouses API', () => {
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

  test('POST /warehouses - Create new warehouse', async ({ request }) => {
    const response = await request.post('http://localhost:3000/warehouses', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        code: 'WH-001',
        name: 'Main Warehouse',
        address: 'Seoul, Gangnam-gu',
        manager: 'John Doe',
        phone: '02-1234-5678',
        isActive: true,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.code).toBe('WH-001');
    expect(data.name).toBe('Main Warehouse');
    warehouseId = data.id;
  });

  test('GET /warehouses - Get all warehouses', async ({ request }) => {
    const response = await request.get('http://localhost:3000/warehouses', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /warehouses/:id - Get single warehouse', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/warehouses/${warehouseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(warehouseId);
    expect(data.code).toBe('WH-001');
  });

  test('PATCH /warehouses/:id - Update warehouse', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/warehouses/${warehouseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        phone: '02-9876-5432',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.phone).toBe('02-9876-5432');
  });

  test('DELETE /warehouses/:id - Delete warehouse', async ({ request }) => {
    const response = await request.delete(`http://localhost:3000/warehouses/${warehouseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(204);
  });
});
