import { Page } from 'puppeteer';
import { BaseParser, ScrapedData, ScrapedPrice, ScrapedStock } from './base.parser';
import { StockStatus } from '../../product/entities/price-history.entity';

export class DigikeyParser extends BaseParser {
  constructor() {
    super('DigikeyParser');
  }
  async parsePrices(page: Page): Promise<ScrapedPrice[]> {
    const prices: ScrapedPrice[] = [];

    try {
      // Try multiple selectors for price table
      const priceRows = await page.$$(
        '.product-pricing tbody tr, table.product-pricing tbody tr, .pricing-table tbody tr, .pricings-table tbody tr',
      );

      if (priceRows.length > 0) {
        for (const row of priceRows) {
          try {
            const quantityText = await row.$eval(
              'td:first-child, .pricing-break-qty, .break-qty',
              (el) => el.textContent?.trim() || '',
            );
            const priceText = await row.$eval(
              'td:nth-child(2), .pricing-break-price, .unit-price',
              (el) => el.textContent?.trim() || '',
            );

            const quantity = parseInt(quantityText.replace(/[^0-9]/g, '')) || 1;
            const price = this.parsePrice(priceText);

            if (price > 0) {
              prices.push({
                quantity,
                unitPrice: price / quantity,
                currency: 'USD',
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
          '.product-pricing .pricing-value',
          '.pricing-value',
          '.product-price',
          '.price-display',
          'span[class*="price"]',
        ];

        for (const selector of mainPriceSelectors) {
          try {
            const mainPriceText = await this.safeExtractText(page, selector);
            const price = this.parsePrice(mainPriceText);
            
            if (price > 0) {
              prices.push({
                quantity: 1,
                unitPrice: price,
                currency: 'USD',
              });
              break;
            }
          } catch (error) {
            continue;
          }
        }
      }
    } catch (error) {
      console.error('DigiKey price parsing error:', error);
    }

    return prices.length > 0 ? prices : [{ quantity: 1, unitPrice: 0, currency: 'USD' }];
  }

  async parseStock(page: Page): Promise<ScrapedStock> {
    try {
      const stockSelectors = [
        '.product-stock',
        '.product-availability',
        '.availability',
        '.stock-status',
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

      if (stockText.includes('Out of Stock') || 
          stockText.includes('Not Available') ||
          stockText.includes('No stock') ||
          stockText.includes('Unavailable')) {
        return {
          quantity: 0,
          status: StockStatus.OUT_OF_STOCK,
        };
      }

      const quantityMatch = stockText.match(/([0-9,]+)/);
      const quantity = quantityMatch
        ? parseInt(quantityMatch[1].replace(/,/g, ''))
        : 100;

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
        '.product-lead-time',
        '.product-details-lead-time',
        '.lead-time',
        'div[class*="lead"]',
        'span[class*="lead"]',
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
