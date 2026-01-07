import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

let authToken: string;
let productId: string;
let customerId: string;
let quotationId: string;

test.describe('Quotations API', () => {
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
        partNumber: 'QT-TEST-001',
        partName: 'Test Product for Quotation',
        manufacturer: 'Test Manufacturer',
        standardPrice: 5000,
        unit: 'EA',
        targetSites: [],
        alertThreshold: { priceChangePercent: 10, stockMin: 10 },
      },
    });
    const productData = await productResponse.json();
    productId = productData.id;

    // Create test customer
    const customerResponse = await request.post('http://localhost:3000/customers', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        code: 'QT-CUS-001',
        name: 'Test Customer',
        email: 'test@example.com',
        discountRate: 5,
      },
    });
    const customerData = await customerResponse.json();
    customerId = customerData.id;
  });

  test('POST /quotations - Create new quotation', async ({ request }) => {
    const response = await request.post('http://localhost:3000/quotations', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        customerId,
        title: 'Test Quotation',
        taxRate: 10,
        notes: 'Test quotation notes',
        terms: 'Test terms',
        createdBy: 'testuser',
        items: [
          {
            productId,
            quantity: 10,
            unitPrice: 5000,
            discount: 5,
            memo: 'Test item memo',
          },
        ],
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('quotationNumber');
    expect(data.status).toBe('draft');
    expect(data.items).toHaveLength(1);
    expect(data.items[0].amount).toBe(47500); // 10 * 5000 * 0.95
    expect(data.subtotal).toBe(47500);
    expect(data.taxAmount).toBe(4750);
    expect(data.totalAmount).toBe(52250);
    quotationId = data.id;
  });

  test('GET /quotations - Get all quotations', async ({ request }) => {
    const response = await request.get('http://localhost:3000/quotations', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /quotations with filters', async ({ request }) => {
    const response = await request.get('http://localhost:3000/quotations?status=draft', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    data.forEach((q: any) => expect(q.status).toBe('draft'));
  });

  test('GET /quotations/:id - Get single quotation', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/quotations/${quotationId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(quotationId);
    expect(data).toHaveProperty('quotationNumber');
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('customer');
  });

  test('PATCH /quotations/:id - Update quotation', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/quotations/${quotationId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        title: 'Updated Test Quotation',
        taxRate: 8,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.title).toBe('Updated Test Quotation');
    expect(data.taxRate).toBe(8);
  });

  test('GET /quotations/:id/pdf - Download PDF', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/quotations/${quotationId}/pdf`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/pdf');
  });

  test('POST /quotations/:id/send-email - Send quotation by email', async ({ request }) => {
    const response = await request.post(`http://localhost:3000/quotations/${quotationId}/send-email`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        recipients: ['test@example.com'],
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.recipients).toEqual(['test@example.com']);
  });

  test('PATCH /quotations/:id/status - Update quotation status', async ({ request }) => {
    const response = await request.patch(`http://localhost:3000/quotations/${quotationId}/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        status: 'approved',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('approved');
  });

  test('DELETE /quotations/:id - Delete quotation', async ({ request }) => {
    // Create a new quotation to delete
    const createResponse = await request.post('http://localhost:3000/quotations', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        customerId,
        title: 'Quotation to Delete',
        items: [{ productId, quantity: 1, unitPrice: 100 }],
      },
    });
    const createData = await createResponse.json();
    const deleteId = createData.id;

    const response = await request.delete(`http://localhost:3000/quotations/${deleteId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status()).toBe(204);
  });
});
