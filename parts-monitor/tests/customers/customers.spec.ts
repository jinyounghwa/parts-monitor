import { test, expect } from '@playwright/test';

let authToken: string;
let customerId: string;

test.describe('Customers API', () => {
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

  test('POST /customers - Create new customer', async ({ request }) => {
    const response = await request.post('http://localhost:3000/customers', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        code: 'CUS-001',
        name: 'Test Corporation',
        businessNumber: '123-45-67890',
        representative: 'Kim Young-hwa',
        contactPerson: 'Park Ji-hoon',
        phone: '02-1111-2222',
        email: 'contact@testcorp.com',
        address: 'Seoul, Seocho-gu',
        discountRate: 5,
        paymentTerms: 'NET30',
        isActive: true,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.code).toBe('CUS-001');
    expect(data.name).toBe('Test Corporation');
    customerId = data.id;
  });

  test('GET /customers - Get all customers', async ({ request }) => {
    const response = await request.get('http://localhost:3000/customers', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /customers/:id - Get single customer', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(customerId);
    expect(data.code).toBe('CUS-001');
  });

  test('PATCH /customers/:id - Update customer', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        discountRate: 10,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.discountRate).toBe(10);
  });

  test('DELETE /customers/:id - Delete customer', async ({ request }) => {
    const response = await request.delete(`http://localhost:3000/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(204);
  });
});
