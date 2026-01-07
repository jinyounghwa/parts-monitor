import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
    })
      .overrideProvider(ConfigService)
      .useFactory({
        provide: ConfigService,
        useFactory: () => {
          const service = new ConfigService();
          service.set('DATABASE_SYNCHRONIZE', 'true');
          return service;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('Hello World!');
      });
  });
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.name).toBe('Test User');
          authToken = res.body.accessToken;
          userId = res.body.user.id;
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          name: 'Test User',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'password123',
          name: 'Test User',
        });
      authToken = res.body.accessToken;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let productId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const authRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'product@example.com',
        password: 'password123',
        name: 'Test User',
      });
    authToken = authRes.body.accessToken;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/products', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partNumber: 'TEST-001',
          manufacturer: 'Test Manufacturer',
          description: 'Test Product Description',
          targetSites: ['danawa'],
          alertThreshold: { price: 10000, stock: 10 },
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.partNumber).toBe('TEST-001');
          productId = res.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partNumber: '',
          manufacturer: '',
        })
        .expect(400);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect(Array.isArray);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partNumber: 'TEST-002',
          manufacturer: 'Test Manufacturer',
          targetSites: ['danawa'],
          alertThreshold: { price: 10000, stock: 10 },
        });
      productId = res.body.id;
    });

    it('should get product by id', () => {
      return request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('partNumber');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/api/products/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partNumber: 'TEST-003',
          manufacturer: 'Test Manufacturer',
          targetSites: ['danawa'],
          alertThreshold: { price: 10000, stock: 10 },
        });
      productId = res.body.id;
    });

    it('should update product', () => {
      return request(app.getHttpServer())
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('Updated Description');
        });
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partNumber: 'TEST-004',
          manufacturer: 'Test Manufacturer',
          targetSites: ['danawa'],
          alertThreshold: { price: 10000, stock: 10 },
        });
      productId = res.body.id;
    });

    it('should delete product', () => {
      return request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const authRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'dashboard@example.com',
        password: 'password123',
        name: 'Test User',
      });
    authToken = authRes.body.accessToken;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/dashboard/stats', () => {
    it('should get dashboard stats', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalProducts');
          expect(res.body).toHaveProperty('lastScrapeAt');
          expect(res.body).toHaveProperty('significantPriceChanges');
          expect(res.body).toHaveProperty('lowStockAlerts');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/alerts', () => {
    it('should get recent alerts', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/alerts?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('priceAlerts');
          expect(res.body).toHaveProperty('stockAlerts');
        });
    });
  });
});

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body.status).toBe('ok');
        });
    });
  });
});
