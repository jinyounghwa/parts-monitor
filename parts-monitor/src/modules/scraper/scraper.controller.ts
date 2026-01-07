import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Queue } from 'bull';
import { ScraperService } from './scraper.service';

@Controller('api/scraper')
@UseGuards(JwtAuthGuard)
export class ScraperController {
  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    private scraperService: ScraperService,
  ) {}

  @Post('run')
  async runManualScrape(@Body() body: { productId: string }) {
    const job = await this.scrapingQueue.add('daily-scrape', {
      productIds: [body.productId],
    });

    return {
      jobId: job.id,
      message: 'Scraping job started',
    };
  }

  @Post('run-batch')
  async runBatchScrape(@Body() body: { productIds: string[] }) {
    const job = await this.scrapingQueue.add('daily-scrape', {
      productIds: body.productIds,
    });

    return {
      jobId: job.id,
      message: `Scraping job started for ${body.productIds.length} products`,
    };
  }

  @Post('run-single')
  async runSingleScrape(@Body() body: { productId: string; site: string; url: string }) {
    try {
      const result = await this.scraperService.scrapeProduct(
        body.productId,
        body.site,
        body.url,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('job/:id')
  async getJobStatus(@Param('id') jobId: string) {
    const job = await this.scrapingQueue.getJob(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      success: true,
      jobId,
      state,
      progress,
      data: job.returnvalue,
    };
  }

  @Get('supported-sites')
  getSupportedSites() {
    return {
      sites: [
        { id: 'danawa', name: '다나와', url: 'https://www.danawa.com' },
        { id: 'mouser', name: 'Mouser', url: 'https://www.mouser.com' },
        { id: 'digikey', name: 'Digi-Key', url: 'https://www.digikey.com' },
      ],
    };
  }
}
