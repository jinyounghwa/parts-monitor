import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ProductService } from '../product/product.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    private readonly productService: ProductService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async scheduleDailyScrape() {
    this.logger.log('Scheduling daily scrape');
    
    try {
      const products = await this.productService.findAllActiveProducts();
      const productIds = products.map(p => p.id);

      if (productIds.length > 0) {
        await this.scrapingQueue.add('daily-scrape', { productIds }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000,
          },
        });
        
        this.logger.log(`Daily scrape scheduled for ${productIds.length} products`);
      }
    } catch (error) {
      this.logger.error('Failed to schedule daily scrape', error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async scheduleDailyReport() {
    this.logger.log('Scheduling daily report');
    
    try {
      const products = await this.productService.findAllActiveProducts();
      const productIds = products.map(p => p.id);

      if (productIds.length > 0) {
        const monitoringJobs = await this.productService['monitoringJobRepository'].find({
          where: { isActive: true },
        });

        for (const job of monitoringJobs) {
          await this.notificationQueue.add('daily-report', {
            recipients: job.emailRecipients,
            productIds: job.productIds,
          });
        }
        
        this.logger.log('Daily report scheduled');
      }
    } catch (error) {
      this.logger.error('Failed to schedule daily report', error.stack);
    }
  }
}
