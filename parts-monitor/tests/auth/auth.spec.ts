import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  let authToken: string;

  test('POST /api/auth/register - Register new user', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'TestPassword123!',
        role: 'USER',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('user');
    expect(data.user.username).toBe('testuser');
  });

  test('POST /api/auth/login - Login with valid credentials', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'TestPassword123!',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('user');
    authToken = data.access_token;
  });

  test('POST /api/auth/login - Fail with invalid credentials', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('GET /api/auth/profile - Get user profile', async ({ request }) => {
    if (!authToken) {
      const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
        data: {
          username: 'testuser',
          password: 'TestPassword123!',
        },
      });
      const loginData = await loginResponse.json();
      authToken = loginData.access_token;
    }

    const response = await request.get('http://localhost:3000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('username');
    expect(data).toHaveProperty('email');
    expect(data.username).toBe('testuser');
  });

  test('GET /api/auth/profile - Fail without authentication', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/auth/profile');

    expect(response.status()).toBe(401);
  });
});
