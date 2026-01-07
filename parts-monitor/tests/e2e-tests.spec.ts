import { test, expect } from '@playwright/test';

test.describe('Parts Monitor Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for the application
    page.setDefaultTimeout(10000);
  });

  test('Backend health check should return ok status', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('Frontend should load successfully', async ({ page }) => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Check that the page has loaded
    await expect(page).toHaveTitle(/Home|Login|Dashboard/i);

    // The page should be visible
    expect(page.url()).toContain('localhost:3001');
  });

  test('Backend should have auth endpoints available', async ({ request }) => {
    // Test registration endpoint exists
    const response = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User'
      },
    });

    // Should return 201 (created) or 400 (bad request) if validation fails
    // But endpoint should exist and be callable
    expect([201, 400, 409, 422]).toContain(response.status());
  });

  test('Backend should have product endpoints available', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/products');

    // Should return 200 with data or 401 if auth is required
    expect([200, 401, 403]).toContain(response.status());
  });

  test('Backend should have dashboard endpoints available', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/dashboard/stats', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    // Should return 401 for invalid auth, showing endpoint exists
    expect([200, 401, 403]).toContain(response.status());
  });

  test('All required services should be running', async ({ request }) => {
    // Check backend health
    const backendHealth = await request.get('http://localhost:3000/api/health');
    expect(backendHealth.status()).toBe(200);

    // Check frontend is responding
    const frontendResponse = await request.get('http://localhost:3001');
    expect(frontendResponse.status()).toBe(200);

    // All services operational
    console.log('✓ All services running successfully');
  });
});
