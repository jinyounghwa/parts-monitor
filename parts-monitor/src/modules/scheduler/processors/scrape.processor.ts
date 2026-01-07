import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ScraperService } from '../../scraper/scraper.service';
import { ProductService } from '../../product/product.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { StockStatus } from '../../product/entities/price-history.entity';

@Processor('scraping')
export class ScrapeProcessor {
  private readonly logger = new Logger(ScrapeProcessor.name);

  constructor(
    private readonly scraperService: ScraperService,
    private readonly productService: ProductService,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  @Process('daily-scrape')
  async handleDailyScrape(job: Job<{ productIds: string[] }>) {
    const { productIds } = job.data;
    this.logger.log(`Starting daily scrape for ${productIds.length} products`);

    const results = {
      success: 0,
      failed: 0,
      alerts: 0,
    };

    for (const productId of productIds) {
      try {
        const product = await this.productService.findOne(productId);
        
        if (!product.isActive) {
          this.logger.log(`Product ${productId} is inactive, skipping`);
          continue;
        }

        for (const site of product.targetSites) {
          if (!site.isActive) continue;

          try {
            const scrapedData = await this.scraperService.scrapeProduct(
              productId,
              site.name,
              site.url,
            );

            const previousData = await this.productService.findLatest(
              productId,
              site.name,
            );

            const changes = this.calculateChanges(scrapedData, previousData);

            await this.productService['priceHistoryRepository'].save({
              productId,
              site: site.name,
              url: site.url,
              prices: scrapedData.prices,
              stockQuantity: scrapedData.stock.quantity,
              stockStatus: scrapedData.stock.status,
              leadTime: scrapedData.leadTime,
              priceChange: changes.priceChange,
              stockChange: changes.stockChange,
              screenshotS3Key: scrapedData.metadata?.screenshotS3Key,
            });

            const shouldAlert = this.checkAlertConditions(product, changes);
            
            if (shouldAlert) {
              await this.notificationQueue.add('alert', {
                productId,
                site: site.name,
                changes,
                type: changes.priceChange > 0 ? 'price-increase' : 'price-decrease',
              });
              results.alerts++;
            }

            results.success++;
            this.logger.log(`Successfully scraped ${product.partNumber} from ${site.name}`);

          } catch (error) {
            this.logger.error(
              `Failed to scrape ${product.partNumber} from ${site.name}`,
              error.stack,
            );
            results.failed++;
          }

          await this.delay(3000);
        }

      } catch (error) {
        this.logger.error(`Failed to process product ${productId}`, error.stack);
        results.failed++;
      }
    }

    this.logger.log(`Daily scrape completed: ${JSON.stringify(results)}`);
    return results;
  }

  private calculateChanges(current: any, previous: any) {
    if (!previous) {
      return { priceChange: 0, stockChange: 0 };
    }

    // Handle empty prices array
    const currentPrices = current.prices || [];
    const previousPrices = previous.prices || [];
    
    const currentPrice = currentPrices.length > 0 && currentPrices[0] 
      ? currentPrices[0].unitPrice 
      : 0;
    const previousPrice = previousPrices.length > 0 && previousPrices[0] 
      ? previousPrices[0].unitPrice 
      : 0;
      
    const priceChange = previousPrice > 0 
      ? ((currentPrice - previousPrice) / previousPrice) * 100 
      : 0;

    const currentStock = current.stock?.quantity || 0;
    const stockChange = currentStock - (previous.stockQuantity || 0);

    return {
      priceChange: parseFloat(priceChange.toFixed(2)),
      stockChange,
    };
  }

  private checkAlertConditions(product: any, changes: any): boolean {
    const { priceChangePercent, stockMin } = product.alertThreshold;
    
    return (
      Math.abs(changes.priceChange) >= priceChangePercent ||
      changes.stockChange < stockMin
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
