import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ScrapingHistoryService } from './scraping-history.service';
import { ScraperService } from '../scraper/scraper.service';
import { ScraperModule } from '../scraper/scraper.module';

@Injectable()
export class ProductRefreshService {
  private readonly logger = new Logger(ProductRefreshService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly historyService: ScrapingHistoryService,
    private readonly scraperService: ScraperService,
  ) {}

  async refreshSingleProduct(productId: string, triggeredBy?: string) {
    const startTime = Date.now();

    try {
      this.logger.log(`Starting refresh for product: ${productId}`);

      const product = await this.productRepo.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (!product.targetSites || product.targetSites.length === 0) {
        throw new Error(`No target sites configured for product: ${productId}`);
      }

      const oldPrice = product.standardPrice;
      const results = [];

      // Scrape from each target site
      for (const site of product.targetSites) {
        try {
          const result = await this.scraperService.scrapeProduct(
            productId,
            site.name,
            site.url,
          );

          results.push({ ...result, success: true });

          // Update product if scrape was successful
          // result is the data itself
          const scrapedPrice = result.prices && result.prices.length > 0 ? result.prices[0].unitPrice : null;
          const scrapedStock = result.stock ? result.stock.quantity : 0;

          // Update price if changed
          if (scrapedPrice !== null && scrapedPrice !== product.standardPrice) {
            product.standardPrice = scrapedPrice;

            // Add to price history (logic omitted as in original)
          }

          // Update last scraped info
          product.lastScrapedAt = new Date();
          product.lastScrapedSite = site.name;

          await this.productRepo.save(product);

          // Record scraping history
          await this.historyService.createHistory({
            productId,
            site: site.name,
            url: site.url,
            scrapedData: result as any, // Cast to any to satisfy mismatched type expectations in historyService if needed
            success: true,
            errorMessage: null,
            oldPrice,
            newPrice: scrapedPrice,
            oldStock: 0, // You might need to track this
            newStock: scrapedStock,
            scrapeDuration: Date.now() - startTime,
            triggerType: 'manual',
            triggeredBy,
          });
        } catch (error) {
          this.logger.error(
            `Failed to scrape ${productId} from ${site.name}: ${error.message}`,
          );

          // Record failed attempt
          await this.historyService.createHistory({
            productId,
            site: site.name,
            url: site.url,
            success: false,
            errorMessage: error.message,
            oldPrice,
            newPrice: oldPrice,
            oldStock: 0,
            newStock: 0,
            scrapeDuration: Date.now() - startTime,
            triggerType: 'manual',
            triggeredBy,
          });
        }
      }

      // Reload product with updates
      const updatedProduct = await this.productRepo.findOne({
        where: { id: productId },
      });

      this.logger.log(`Refresh completed for product: ${productId}`);

      return {
        success: true,
        product: updatedProduct,
        results,
        message: 'Product refreshed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to refresh product ${productId}: ${error.message}`);

      // Record failed refresh
      await this.historyService.createHistory({
        productId,
        site: 'unknown',
        success: false,
        errorMessage: error.message,
        oldPrice: 0,
        newPrice: 0,
        oldStock: 0,
        newStock: 0,
        scrapeDuration: Date.now() - startTime,
        triggerType: 'manual',
        triggeredBy,
      });

      throw error;
    }
  }

  async refreshMultipleProducts(productIds: string[], triggeredBy?: string) {
    this.logger.log(`Starting batch refresh for ${productIds.length} products`);

    const results = [];

    for (const productId of productIds) {
      try {
        const result = await this.refreshSingleProduct(productId, triggeredBy);
        results.push({ productId, ...result });
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: error.message,
        });
      }
    }

    this.logger.log(`Batch refresh completed: ${results.length} products`);

    return results;
  }

  async refreshAllProducts(triggeredBy?: string) {
    const products = await this.productRepo.find({
      where: { isActive: true },
    });

    this.logger.log(`Starting refresh for all ${products.length} active products`);

    return this.refreshMultipleProducts(
      products.map((p) => p.id),
      triggeredBy,
    );
  }

  async refreshBySite(siteName: string, triggeredBy?: string) {
    const products = await this.productRepo.find({
      where: { isActive: true },
    });

    // Filter products that have this site in targetSites
    const productsWithSite = products.filter((p) =>
      p.targetSites?.some((s) => s.name === siteName),
    );

    this.logger.log(
      `Starting refresh for ${productsWithSite.length} products from ${siteName}`,
    );

    return this.refreshMultipleProducts(
      productsWithSite.map((p) => p.id),
      triggeredBy,
    );
  }
}
