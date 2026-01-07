import { Page } from 'puppeteer';
import { Logger } from '@nestjs/common';
import { ScrapedPrice, StockStatus } from '../../product/entities/price-history.entity';

export type { ScrapedPrice };

export interface ScrapedStock {
  quantity: number;
  status: StockStatus;
}

export interface ScrapedData {
  prices: ScrapedPrice[];
  stock: ScrapedStock;
  leadTime: string;
  metadata?: Record<string, any>;
}

export abstract class BaseParser {
  protected readonly logger: Logger;

  constructor(name: string) {
    this.logger = new Logger(name);
  }

  abstract parsePrices(page: Page): Promise<ScrapedPrice[]>;
  abstract parseStock(page: Page): Promise<ScrapedStock>;
  abstract parseLeadTime(page: Page): Promise<string>;

  async parse(page: Page): Promise<ScrapedData> {
    const [prices, stock, leadTime] = await Promise.all([
      this.parsePrices(page),
      this.parseStock(page),
      this.parseLeadTime(page),
    ]);

    return {
      prices,
      stock,
      leadTime,
    };
  }

  protected async waitForSelector(
    page: Page,
    selector: string,
    timeout = 5000,
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  protected async safeExtractText(
    page: Page,
    selector: string,
  ): Promise<string> {
    try {
      return await page.$eval(selector, (el) => el.textContent?.trim() || '');
    } catch {
      return '';
    }
  }

  protected parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }
}
