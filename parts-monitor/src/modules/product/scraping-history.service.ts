import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingHistory } from './entities/scraping-history.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ScrapingHistoryService {
  private readonly logger = new Logger(ScrapingHistoryService.name);

  constructor(
    @InjectRepository(ScrapingHistory)
    private readonly historyRepo: Repository<ScrapingHistory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createHistory(params: {
    productId: string;
    site: string;
    url?: string;
    scrapedData?: any;
    success: boolean;
    errorMessage?: string;
    oldPrice?: number;
    newPrice?: number;
    oldStock?: number;
    newStock?: number;
    scrapeDuration: number;
    triggerType: 'manual' | 'scheduled';
    triggeredBy?: string;
  }) {
    const history = this.historyRepo.create({
      ...params,
      priceChanged:
        params.oldPrice !== undefined &&
        params.newPrice !== undefined &&
        params.oldPrice !== params.newPrice,
      stockChanged:
        params.oldStock !== undefined &&
        params.newStock !== undefined &&
        params.oldStock !== params.newStock,
      priceChangePercent:
        params.oldPrice && params.newPrice
          ? ((params.newPrice - params.oldPrice) / params.oldPrice) * 100
          : null,
    });

    await this.historyRepo.save(history);

    this.logger.log(`Scraping history recorded: ${params.productId} - ${params.site}`);

    return history;
  }

  async getProductHistory(productId: string, limit = 20) {
    return this.historyRepo.find({
      where: { productId },
      relations: ['product'],
      order: { scrapedAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentHistory(limit = 50) {
    return this.historyRepo.find({
      relations: ['product'],
      order: { scrapedAt: 'DESC' },
      take: limit,
    });
  }

  async getHistoryStats(productId?: string) {
    const where = productId ? { productId } : {};

    const [total, success, failed, manual, scheduled] = await Promise.all([
      this.historyRepo.count({ where }),
      this.historyRepo.count({ where: { ...where, success: true } }),
      this.historyRepo.count({ where: { ...where, success: false } }),
      this.historyRepo.count({ where: { ...where, triggerType: 'manual' } }),
      this.historyRepo.count({ where: { ...where, triggerType: 'scheduled' } }),
    ]);

    return {
      total,
      success,
      failed,
      manual,
      scheduled,
      successRate: total > 0 ? (success / total) * 100 : 0,
    };
  }

  async getFailedAttempts(limit = 20) {
    return this.historyRepo.find({
      where: { success: false },
      relations: ['product'],
      order: { scrapedAt: 'DESC' },
      take: limit,
    });
  }

  async getMostRecent(productId: string) {
    return this.historyRepo.findOne({
      where: { productId },
      relations: ['product'],
      order: { scrapedAt: 'DESC' },
    });
  }
}
