import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { PriceHistory } from '../product/entities/price-history.entity';
import { ScrapingHistory } from '../product/entities/scraping-history.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockTransaction } from '../inventory/entities/stock-transaction.entity';
import { Quotation } from '../quotation/entities/quotation.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepository: Repository<PriceHistory>,
    @InjectRepository(ScrapingHistory)
    private readonly scrapingHistoryRepository: Repository<ScrapingHistory>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockTransaction)
    private readonly transactionRepository: Repository<StockTransaction>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
  ) {}

  async getDashboardStats() {
    const totalProducts = await this.productRepository.count({
      where: { isActive: true },
    });

    const recentPrices = await this.priceHistoryRepository.find({
      order: { scrapedAt: 'DESC' },
      take: 1,
    });

    const lastScrapeAt = recentPrices[0]?.scrapedAt || null;

    const priceChanges = await this.priceHistoryRepository
      .createQueryBuilder('ph')
      .select('COUNT(*)', 'count')
      .where('ABS(ph.priceChange) >= 5')
      .getRawOne();

    // Low stock alerts - count inventories with low or critical status
    const inventories = await this.inventoryRepository.find();
    const lowStockAlerts = inventories.filter(
      inv => inv.status === 'low' || inv.status === 'critical' || inv.status === 'out_of_stock'
    ).length;

    return {
      totalProducts,
      lastScrapeAt,
      significantPriceChanges: parseInt(priceChanges.count) || 0,
      lowStockAlerts,
    };
  }

  async getInventorySummary() {
    const inventories = await this.inventoryRepository.find({
      relations: ['product', 'warehouse'],
    });

    const summary = {
      total: inventories.length,
      low: inventories.filter(inv => inv.status === 'low').length,
      critical: inventories.filter(inv => inv.status === 'critical').length,
      outOfStock: inventories.filter(inv => inv.status === 'out_of_stock').length,
      sufficient: inventories.filter(inv => inv.status === 'sufficient').length,
    };

    return summary;
  }

  async getProductPriceHistory(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const histories = await this.priceHistoryRepository
      .createQueryBuilder('ph')
      .where('ph.productId = :productId', { productId })
      .andWhere('ph.scrapedAt >= :startDate', { startDate })
      .orderBy('ph.scrapedAt', 'ASC')
      .getMany();

    return {
      productId,
      data: histories.map((h) => ({
        date: h.scrapedAt,
        price: h.prices[0]?.unitPrice || 0,
        stockQuantity: h.stockQuantity,
        site: h.site,
      })),
    };
  }

  async getAllProductPriceHistories(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const products = await this.productRepository.find({
      where: { isActive: true },
    });

    const results = await Promise.all(
      products.map(async (product) => {
        const histories = await this.priceHistoryRepository
          .createQueryBuilder('ph')
          .where('ph.productId = :productId', { productId: product.id })
          .andWhere('ph.scrapedAt >= :startDate', { startDate })
          .orderBy('ph.scrapedAt', 'ASC')
          .getMany();

        return {
          product,
          data: histories.map((h) => ({
            date: h.scrapedAt,
            price: h.prices[0]?.unitPrice || 0,
            stockQuantity: h.stockQuantity,
            site: h.site,
          })),
        };
      })
    );

    return results;
  }

  async getRecentAlerts(limit: number = 10) {
    const priceAlerts = await this.priceHistoryRepository
      .createQueryBuilder('ph')
      .leftJoinAndSelect('ph.product', 'product')
      .where('ABS(ph.priceChange) >= 5')
      .orderBy('ph.scrapedAt', 'DESC')
      .limit(limit)
      .getMany();

    const stockAlerts = await this.priceHistoryRepository
      .createQueryBuilder('ph')
      .leftJoinAndSelect('ph.product', 'product')
      .where('ph.stockQuantity < 100')
      .orderBy('ph.scrapedAt', 'DESC')
      .limit(limit)
      .getMany();

    return {
      priceAlerts: priceAlerts.map((alert) => ({
        type: 'price',
        product: alert.product.partNumber,
        site: alert.site,
        change: alert.priceChange,
        date: alert.scrapedAt,
      })),
      stockAlerts: stockAlerts.map((alert) => ({
        type: 'stock',
        product: alert.product.partNumber,
        site: alert.site,
        quantity: alert.stockQuantity,
        date: alert.scrapedAt,
      })),
    };
  }
}
