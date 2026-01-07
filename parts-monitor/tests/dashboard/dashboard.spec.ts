import { test, expect } from '@playwright/test';

let authToken: string;

test.describe('Dashboard API', () => {
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

  test('GET /api/dashboard/summary - Get dashboard summary', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/dashboard/summary', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('inventory');
    expect(data).toHaveProperty('quotations');
    expect(data).toHaveProperty('recentTransactions');

    expect(data.inventory).toHaveProperty('total');
    expect(data.inventory).toHaveProperty('low');
    expect(data.inventory).toHaveProperty('critical');
    expect(data.inventory).toHaveProperty('outOfStock');

    expect(data.quotations).toHaveProperty('draft');
    expect(data.quotations).toHaveProperty('sent');
    expect(data.quotations).toHaveProperty('approved');
    expect(data.quotations).toHaveProperty('thisMonth');

    expect(Array.isArray(data.recentTransactions)).toBeTruthy();
  });

  test('GET /api/dashboard/inventory-summary - Get inventory summary', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/dashboard/inventory-summary', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('low');
    expect(data).toHaveProperty('critical');
    expect(data).toHaveProperty('outOfStock');
    expect(data).toHaveProperty('sufficient');
  });

  test('GET /api/dashboard/alerts - Get recent alerts', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/dashboard/alerts', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('priceAlerts');
    expect(data).toHaveProperty('stockAlerts');
    expect(Array.isArray(data.priceAlerts)).toBeTruthy();
    expect(Array.isArray(data.stockAlerts)).toBeTruthy();
  });

  test('GET /api/dashboard/alerts with limit', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/dashboard/alerts?limit=5', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.priceAlerts.length).toBeLessThanOrEqual(5);
    expect(data.stockAlerts.length).toBeLessThanOrEqual(5);
  });
});
