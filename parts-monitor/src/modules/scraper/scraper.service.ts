import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';
import { DanawaParser } from './parsers/danawa.parser';
import { MouserParser } from './parsers/mouser.parser';
import { DigikeyParser } from './parsers/digikey.parser';
import { BaseParser, ScrapedData } from './parsers/base.parser';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class ScraperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScraperService.name);
  private browser: Browser;
  private readonly parsers: Map<string, BaseParser>;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 2000;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {
    this.parsers = new Map([
      ['danawa', new DanawaParser()],
      ['mouser', new MouserParser()],
      ['digikey', new DigikeyParser()],
    ]);
  }

  async onModuleInit() {
    this.logger.log('Initializing Puppeteer browser');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      this.logger.log('Puppeteer browser initialized successfully');
    } catch (error) {
      this.logger.warn(`Failed to initialize Puppeteer browser: ${error.message}. Scraping features will be unavailable.`);
      // Continue without browser - scraping methods will fail gracefully
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Closing Puppeteer browser');
      await this.browser.close();
      this.logger.log('Puppeteer browser closed');
    }
  }

  async scrapeProduct(
    productId: string,
    site: string,
    url: string,
  ): Promise<ScrapedData> {
    const parser = this.parsers.get(site);
    if (!parser) {
      throw new Error(`Parser not found for site: ${site}`);
    }

    let lastError: Error = new Error('Unknown scraping error');
    let page: Page | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Scraping attempt ${attempt}/${this.maxRetries} for ${site}: ${url}`);

        page = await this.browser.newPage();
        
        await page.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        );

        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          // Block non-essential resources to speed up scraping
          if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        });

        // Set longer timeout for slow connections
        const timeout = this.configService.get('SCRAPE_TIMEOUT_MS', 30000);
        
        this.logger.log(`Navigating to ${url}`);
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout,
        });

        // Wait for page to load
        await this.randomDelay();

        // Parse data
        this.logger.log(`Parsing data from ${site}`);

        let data;
        try {
          data = await parser.parse(page);
        } catch (parseError) {
          this.logger.error(`Failed to parse ${site} page:`, parseError);
          page.close();
          throw new Error(`Parsing failed for ${site}: ${parseError}`);
        }

        // Take screenshot
        this.logger.log(`Taking screenshot for ${site}`);
        const screenshot = await page.screenshot({ 
          fullPage: true,
          type: 'png',
        });

        // Upload to S3
        this.logger.log(`Uploading screenshot to S3`);
        const s3Key = await this.s3Service.uploadScreenshot(
          productId,
          site,
          Buffer.from(screenshot),
        );
        
        this.logger.log(`Scraping successful for ${site}: ${url}`);

        return {
          ...data,
          metadata: {
            screenshotS3Key: s3Key,
            scrapedAt: new Date().toISOString(),
            site,
            url,
          },
        };

      } catch (error) {
        lastError = error;
        this.logger.error(
          `Scraping attempt ${attempt}/${this.maxRetries} failed for ${site}: ${url}`,
          error.stack,
        );

        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying in ${this.retryDelayMs}ms...`);
          await this.sleep(this.retryDelayMs);
        }
      } finally {
        if (page) {
          await page.close().catch((err) => {
            this.logger.warn(`Failed to close page: ${err.message}`);
          });
          page = null;
        }
      }
    }

    this.logger.error(`Scraping failed after ${this.maxRetries} attempts for ${site}: ${url}`);
    throw lastError || new Error('Unknown scraping error');
  }

  private async randomDelay() {
    const minDelay = this.configService.get('SCRAPE_DELAY_MS', 2000) || 2000;
    const maxDelay = minDelay + 2000;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    this.logger.debug(`Waiting ${delay}ms for page to load`);
    await this.sleep(delay);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
