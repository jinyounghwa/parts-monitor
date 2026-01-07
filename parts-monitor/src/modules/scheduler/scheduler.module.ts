import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from './scheduler.service';
import { ScrapeProcessor } from './processors/scrape.processor';
import { ScraperModule } from '../scraper/scraper.module';
import { ProductModule } from '../product/product.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'scraping' },
      { name: 'notification' },
    ),
    ScraperModule,
    ProductModule,
    NotificationModule,
  ],
  providers: [SchedulerService, ScrapeProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}
