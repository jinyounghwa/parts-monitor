import { Page } from 'puppeteer';
import { BaseParser, ScrapedData, ScrapedPrice, ScrapedStock } from './base.parser';
import { StockStatus } from '../../product/entities/price-history.entity';

export class DanawaParser extends BaseParser {
  constructor() {
    super('DanawaParser');
  }
  async parsePrices(page: Page): Promise<ScrapedPrice[]> {
    const prices: ScrapedPrice[] = [];

    try {
      // Try multiple selectors for price list
      const priceElements = await page.$$(
        '.prod_pricelist li:not(.tit) .price_sect, .price-list li .price-section, .item-price-list li .price-sec',
      );

      if (priceElements.length > 0) {
        for (const element of priceElements) {
          try {
            const quantityText = await element.$eval('.tit, .quantity, .qty', (el) =>
              el.textContent?.trim() || '',
            );
            const priceText = await element.$eval('.price, .cost, .unit-price', (el) =>
              el.textContent?.trim() || '',
            );

            const quantity = parseInt(quantityText.replace(/[^0-9]/g, '')) || 1;
            const price = this.parsePrice(priceText);

            if (price > 0) {
              prices.push({
                quantity,
                unitPrice: price / quantity,
                currency: 'KRW',
              });
            }
          } catch (error) {
            continue;
          }
        }
      }

      // Fallback: Try to find main price
      if (prices.length === 0) {
        const mainPriceSelectors = [
          '.total_price strong',
          '.product-price strong',
          '.price-display strong',
          'span.price strong',
        ];

        for (const selector of mainPriceSelectors) {
          try {
            const mainPriceText = await this.safeExtractText(page, selector);
            const price = this.parsePrice(mainPriceText);
            
            if (price > 0) {
              prices.push({
                quantity: 1,
                unitPrice: price,
                currency: 'KRW',
              });
              break;
            }
          } catch (error) {
            continue;
          }
        }
      }
    } catch (error) {
      this.logger.error('Danawa price parsing error:', error);
      throw new Error(`Failed to parse prices from Danawa: ${error}`);
    }

    if (prices.length === 0) {
      throw new Error('No valid prices found on Danawa page');
    }

    return prices;
  }

  async parseStock(page: Page): Promise<ScrapedStock> {
    try {
      const stockSelectors = [
        '.prod_info .desc .stock',
        '.product-info .desc .stock',
        '.stock-status',
        '.availability',
        'div[class*="stock"]',
        'span[class*="stock"]',
      ];

      let stockText = '';
      for (const selector of stockSelectors) {
        try {
          stockText = await this.safeExtractText(page, selector);
          if (stockText) break;
        } catch (error) {
          continue;
        }
      }

      if (!stockText) {
        return {
          quantity: 100,
          status: StockStatus.UNKNOWN,
        };
      }

      if (stockText.includes('품절') || 
          stockText.includes('판매중지') ||
          stockText.includes('재고없음') ||
          stockText.includes('품절') ||
          stockText.includes('Out of Stock')) {
        return {
          quantity: 0,
          status: StockStatus.OUT_OF_STOCK,
        };
      }

      const quantityMatch = stockText.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 100;

      if (quantity < 10) {
        return {
          quantity,
          status: StockStatus.LOW_STOCK,
        };
      }

      return {
        quantity,
        status: StockStatus.IN_STOCK,
      };
    } catch (error) {
      return {
        quantity: 0,
        status: StockStatus.UNKNOWN,
      };
    }
  }

  async parseLeadTime(page: Page): Promise<string> {
    try {
      const leadTimeSelectors = [
        '.prod_info .desc .delivery',
        '.product-info .desc .delivery',
        '.delivery-time',
        '.lead-time',
        'div[class*="delivery"]',
        'span[class*="delivery"]',
      ];

      for (const selector of leadTimeSelectors) {
        try {
          const leadTimeText = await this.safeExtractText(page, selector);
          if (leadTimeText) return leadTimeText;
        } catch (error) {
          continue;
        }
      }

      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }
}
