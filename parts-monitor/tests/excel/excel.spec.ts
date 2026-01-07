import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import ExcelJS from 'exceljs';

let authToken: string;
let productId: string;

test.describe('Excel API', () => {
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
        partNumber: 'EXCEL-TEST-001',
        partName: 'Test Product for Excel',
        manufacturer: 'Test Manufacturer',
        category: 'Test Category',
        specification: 'Test Specification',
        standardPrice: 2000,
        purchasePrice: 1500,
        unit: 'EA',
        targetSites: [],
        alertThreshold: { priceChangePercent: 10, stockMin: 10 },
      },
    });
    const productData = await productResponse.json();
    productId = productData.id;
  });

  test('GET /excel/export/products - Export products to Excel', async ({ request }) => {
    const response = await request.get('http://localhost:3000/excel/export/products', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
  });

  test('GET /excel/export/inventory - Export inventory to Excel', async ({ request }) => {
    const response = await request.get('http://localhost:3000/excel/export/inventory', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
  });

  test('POST /excel/import/products - Import products from Excel', async ({ request }) => {
    // Create a test Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: 'Part Number', key: 'partNumber', width: 15 },
      { header: 'Part Name', key: 'partName', width: 30 },
      { header: 'Manufacturer', key: 'manufacturer', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Specification', key: 'specification', width: 25 },
      { header: 'Standard Price', key: 'standardPrice', width: 12 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 12 },
      { header: 'Unit', key: 'unit', width: 8 },
    ];

    // Add header row
    worksheet.getRow(1).font = { bold: true };

    // Add data rows
    worksheet.addRow({
      partNumber: 'IMP-001',
      partName: 'Imported Product 1',
      manufacturer: 'Import Manufacturer',
      category: 'Import Category',
      specification: 'Import Specification',
      standardPrice: 1000,
      purchasePrice: 800,
      unit: 'EA',
    });

    worksheet.addRow({
      partNumber: 'IMP-002',
      partName: 'Imported Product 2',
      manufacturer: 'Import Manufacturer',
      category: 'Import Category',
      specification: 'Import Specification',
      standardPrice: 2000,
      purchasePrice: 1600,
      unit: 'EA',
    });

    // Convert to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const formData = new FormData();
    formData.append('file', new Blob([buffer]), 'test-import.xlsx');

    const response = await request.post('http://localhost:3000/excel/import/products', {
      headers: { Authorization: `Bearer ${authToken}` },
      multipart: {
        file: {
          name: 'test-import.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: buffer,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('imported');
    expect(data).toHaveProperty('failed');
    expect(data.imported).toBeGreaterThan(0);
  });

  test('POST /excel/import/products - Fail with invalid data', async ({ request }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.addRow({
      partNumber: '', // Invalid: empty part number
      partName: 'Test Product',
      manufacturer: 'Test',
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const formData = new FormData();
    formData.append('file', new Blob([buffer]), 'invalid.xlsx');

    const response = await request.post('http://localhost:3000/excel/import/products', {
      headers: { Authorization: `Bearer ${authToken}` },
      multipart: {
        file: {
          name: 'invalid.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: buffer,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('imported');
    expect(data).toHaveProperty('failed');
    expect(data.imported).toBe(0);
    expect(data.failed).toBeGreaterThan(0);
    expect(data.errors).toContain('Row 2: 부품번호와 부품명은 필수입니다.');
  });
});
