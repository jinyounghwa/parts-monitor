import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity';
import { MonitoringJob } from './entities/monitoring-job.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepository: Repository<PriceHistory>,
    @InjectRepository(MonitoringJob)
    private readonly monitoringJobRepository: Repository<MonitoringJob>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['priceHistories'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateData: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateData);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getHistory(productId: string, days: number = 30): Promise<PriceHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.priceHistoryRepository.find({
      where: { productId },
      order: { scrapedAt: 'DESC' },
      take: 1000,
    });
  }

  async findLatest(
    productId: string,
    site: string | null = null,
    limit: number = 1,
  ): Promise<PriceHistory[]> {
    const whereCondition: any = { productId };
    if (site) {
      whereCondition.site = site;
    }

    return this.priceHistoryRepository.find({
      where: whereCondition,
      order: { scrapedAt: 'DESC' },
      take: limit,
    });
  }

  async analyzeTrend(productId: string, days: number): Promise<any> {
    const histories = await this.getHistory(productId, days);

    if (histories.length === 0) {
      return {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceChangePercent: 0,
      };
    }

    const prices = histories
      .flatMap((h) => h.prices)
      .filter((p) => p.quantity === 1)
      .map((p) => p.unitPrice);

    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const firstPrice = prices[prices.length - 1] || 0;
    const lastPrice = prices[0] || 0;
    const priceChangePercent =
      firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    return {
      averagePrice,
      minPrice,
      maxPrice,
      priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
    };
  }

  async createMonitoringJob(monitoringJob: {
    productIds: string[];
    schedule: string;
    emailRecipients: string[];
  }): Promise<MonitoringJob> {
    const job = this.monitoringJobRepository.create(monitoringJob);
    return this.monitoringJobRepository.save(job);
  }

  async findAllActiveProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
    });
  }
}
