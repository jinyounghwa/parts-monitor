import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity';
import { MonitoringJob } from './entities/monitoring-job.entity';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let priceHistoryRepository: Repository<PriceHistory>;
  let monitoringJobRepository: Repository<MonitoringJob>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PriceHistory),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MonitoringJob),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    priceHistoryRepository = module.get<Repository<PriceHistory>>(
      getRepositoryToken(PriceHistory),
    );
    monitoringJobRepository = module.get<Repository<MonitoringJob>>(
      getRepositoryToken(MonitoringJob),
    );
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        partNumber: 'TEST-001',
        manufacturer: 'Test Manufacturer',
        description: 'Test Product',
        targetSites: ['danawa'],
        alertThreshold: { price: 10000, stock: 10 },
        isActive: true,
      };

      const mockProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(productRepository, 'create').mockReturnValue(mockProduct as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct as any);

      const result = await service.create(createProductDto);

      expect(productRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          partNumber: 'TEST-001',
          manufacturer: 'Test Manufacturer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          partNumber: 'TEST-002',
          manufacturer: 'Test Manufacturer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts as any);

      const result = await service.findAll();

      expect(productRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product with relations', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        partNumber: 'TEST-001',
        manufacturer: 'Test Manufacturer',
        isActive: true,
        priceHistories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);

      const result = await service.findOne(productId);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['priceHistories'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 'non-existent-id';
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '1';
      const updateData = { description: 'Updated description' };
      const mockProduct = {
        id: productId,
        partNumber: 'TEST-001',
        manufacturer: 'Test Manufacturer',
        description: 'Updated description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct as any);

      const result = await service.update(productId, updateData);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(productRepository.save).toHaveBeenCalled();
      expect(result.description).toBe('Updated description');
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        partNumber: 'TEST-001',
        manufacturer: 'Test Manufacturer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(productRepository, 'remove').mockResolvedValue(undefined);

      await service.remove(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('getHistory', () => {
    it('should return price history for a product', async () => {
      const productId = '1';
      const days = 30;
      const mockHistory = [
        {
          id: '1',
          productId,
          site: 'danawa',
          scrapedAt: new Date(),
          prices: [{ quantity: 1, unitPrice: 10000, currency: 'KRW' }],
        },
      ];

      jest.spyOn(priceHistoryRepository, 'find').mockResolvedValue(mockHistory as any);

      const result = await service.getHistory(productId, days);

      expect(priceHistoryRepository.find).toHaveBeenCalledWith({
        where: { productId },
        order: { scrapedAt: 'DESC' },
        take: 1000,
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('analyzeTrend', () => {
    it('should calculate trend metrics correctly', async () => {
      const productId = '1';
      const mockHistory = [
        {
          id: '1',
          productId,
          site: 'danawa',
          scrapedAt: new Date(),
          prices: [{ quantity: 1, unitPrice: 10000, currency: 'KRW' }],
        },
        {
          id: '2',
          productId,
          site: 'danawa',
          scrapedAt: new Date(),
          prices: [{ quantity: 1, unitPrice: 12000, currency: 'KRW' }],
        },
      ];

      jest.spyOn(service, 'getHistory').mockResolvedValue(mockHistory as any);

      const result = await service.analyzeTrend(productId, 30);

      expect(result).toEqual({
        averagePrice: 11000,
        minPrice: 10000,
        maxPrice: 12000,
        priceChangePercent: -16.67,
      });
    });

    it('should return zeros if no history', async () => {
      const productId = '1';
      jest.spyOn(service, 'getHistory').mockResolvedValue([]);

      const result = await service.analyzeTrend(productId, 30);

      expect(result).toEqual({
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceChangePercent: 0,
      });
    });
  });
});
