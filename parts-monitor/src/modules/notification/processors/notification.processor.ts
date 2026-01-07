import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from '../email.service';
import { ProductService } from '../../product/product.service';
import { StockStatus } from '../../product/entities/price-history.entity';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly productService: ProductService,
  ) {}

  @Process('alert')
  async handleAlert(job: Job<any>) {
    const { productId, site, changes, type } = job.data;
    this.logger.log(`Processing alert for product ${productId} from ${site}`);

    try {
      const product = await this.productService.findOne(productId);
      const latestData = await this.productService.findLatest(productId, site);

      if (!product || !latestData) {
        throw new Error('Product or latest data not found');
      }

      const alertData = {
        product,
        site,
        changes,
        currentData: latestData,
        type,
      };

      const recipients = product.alertThreshold?.emailRecipients || 
                       ['admin@example.com'];

      if (type === 'price-increase' || type === 'price-decrease') {
        await this.emailService.sendPriceAlert(recipients, alertData);
      } else if (type === 'stock-alert') {
        await this.emailService.sendStockAlert(recipients, alertData);
      }

      this.logger.log(`Alert sent successfully for product ${productId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process alert for product ${productId}`, error.stack);
      throw error;
    }
  }

  @Process('daily-report')
  async handleDailyReport(job: Job<any>) {
    const { date } = job.data;
    this.logger.log(`Generating daily report for ${date}`);

    try {
      const products = await this.productService.findAll();
      
      const reportData = {
        date: new Date(date),
        products: await Promise.all(
          products.map(async (product) => {
            const histories = await this.productService['priceHistoryRepository'].find({
              where: { productId: product.id },
              order: { scrapedAt: 'DESC' },
              take: 2,
            });

            const currentData = histories[0];
            const previousData = histories[1];

            const alerts: any[] = [];
            
            if (previousData && currentData) {
              const priceChange = currentData.priceChange || 0;
              const stockChange = currentData.stockChange || 0;
              
              if (Math.abs(priceChange) >= product.alertThreshold.priceChangePercent) {
                alerts.push({
                  type: 'price',
                  message: `가격이 ${priceChange > 0 ? '상승' : '하락'}했습니다 (${priceChange.toFixed(2)}%)`,
                  priceChange,
                });
              }

              if (currentData.stockQuantity < product.alertThreshold.stockMin) {
                alerts.push({
                  type: 'stock',
                  message: `재고가 부족합니다 (${currentData.stockQuantity}개)`,
                  stockQuantity: currentData.stockQuantity,
                });
              }
            }

            return {
              product,
              currentData: currentData ? [currentData] : [],
              alerts,
            };
          })
        ),
        summary: {
          totalProducts: products.length,
          priceChanges: 0,
          stockAlerts: 0,
        },
      };

      const recipients = ['admin@example.com'];
      await this.emailService.sendDailyReport(recipients, reportData);

      this.logger.log('Daily report sent successfully');
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to generate daily report', error.stack);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
