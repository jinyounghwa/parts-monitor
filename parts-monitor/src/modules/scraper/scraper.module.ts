import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { S3Service } from '../storage/s3.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'scraping' }),
  ],
  controllers: [ScraperController],
  providers: [ScraperService, S3Service],
  exports: [ScraperService],
})
export class ScraperModule {}
