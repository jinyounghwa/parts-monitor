import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockTransaction } from '../inventory/entities/stock-transaction.entity';

@Injectable()
export class QuotationInventoryService {
  private readonly logger = new Logger(QuotationInventoryService.name);

  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private readonly itemRepo: Repository<QuotationItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockTransaction)
    private readonly transactionRepo: Repository<StockTransaction>,
  ) {}

  /**
   * Reserve stock when quotation is approved
   */
  async reserveStock(quotationId: string, performedBy: string) {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['items', 'items.product'],
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.status !== 'approved') {
      throw new Error('Quotation must be approved to reserve stock');
    }

    this.logger.log(`Reserving stock for quotation: ${quotation.quotationNumber}`);

    const results = [];

    for (const item of quotation.items) {
      try {
        // Check if there's inventory for this product
        const inventory = await this.inventoryRepo.findOne({
          where: { productId: item.productId },
        });

        if (!inventory) {
          this.logger.warn(
            `No inventory found for product: ${item.product.partNumber}`,
          );
          results.push({
            productId: item.productId,
            partNumber: item.product.partNumber,
            status: 'no_inventory',
          });
          continue;
        }

        // Check if there's enough stock
        if (inventory.quantity < item.quantity) {
          this.logger.warn(
            `Insufficient stock for ${item.product.partNumber}: available=${inventory.quantity}, required=${item.quantity}`,
          );
          results.push({
            productId: item.productId,
            partNumber: item.product.partNumber,
            status: 'insufficient_stock',
            available: inventory.quantity,
            required: item.quantity,
          });
          continue;
        }

        // Reserve stock (stock out type = 'OUT')
        const beforeQuantity = inventory.quantity;
        const afterQuantity = inventory.quantity - item.quantity;

        inventory.quantity = afterQuantity;
        inventory.status = this.calculateStatus(
          afterQuantity,
          inventory.safetyStock,
          inventory.reorderPoint,
        );

        await this.inventoryRepo.save(inventory);

        // Record stock transaction
        const transaction = this.transactionRepo.create({
          productId: item.productId,
          warehouseId: inventory.warehouseId,
          type: 'OUT',
          quantity: item.quantity,
          beforeQuantity,
          afterQuantity,
          reference: quotation.quotationNumber,
          memo: `Reserved for quotation: ${quotation.title}`,
          performedBy,
        });

        await this.transactionRepo.save(transaction);

        results.push({
          productId: item.productId,
          partNumber: item.product.partNumber,
          status: 'reserved',
          quantity: item.quantity,
        });

        this.logger.log(
          `Stock reserved: ${item.product.partNumber} -${item.quantity}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to reserve stock for ${item.productId}: ${error.message}`,
        );
        results.push({
          productId: item.productId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return {
      quotationNumber: quotation.quotationNumber,
      totalItems: quotation.items.length,
      results,
      successful: results.filter((r) => r.status === 'reserved').length,
      failed: results.filter((r) => r.status !== 'reserved').length,
    };
  }

  /**
   * Release stock when quotation is cancelled
   */
  async releaseStock(quotationId: string, performedBy: string) {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['items', 'items.product'],
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.status !== 'cancelled') {
      throw new Error('Quotation must be cancelled to release stock');
    }

    this.logger.log(`Releasing stock for quotation: ${quotation.quotationNumber}`);

    const results = [];

    for (const item of quotation.items) {
      try {
        const inventory = await this.inventoryRepo.findOne({
          where: { productId: item.productId },
        });

        if (!inventory) {
          continue;
        }

        // Release stock (stock in type = 'IN')
        const beforeQuantity = inventory.quantity;
        const afterQuantity = inventory.quantity + item.quantity;

        inventory.quantity = afterQuantity;
        inventory.status = this.calculateStatus(
          afterQuantity,
          inventory.safetyStock,
          inventory.reorderPoint,
        );

        await this.inventoryRepo.save(inventory);

        // Record stock transaction
        const transaction = this.transactionRepo.create({
          productId: item.productId,
          warehouseId: inventory.warehouseId,
          type: 'IN',
          quantity: item.quantity,
          beforeQuantity,
          afterQuantity,
          reference: quotation.quotationNumber,
          memo: `Released from cancelled quotation: ${quotation.title}`,
          performedBy,
        });

        await this.transactionRepo.save(transaction);

        results.push({
          productId: item.productId,
          partNumber: item.product.partNumber,
          status: 'released',
          quantity: item.quantity,
        });

        this.logger.log(
          `Stock released: ${item.product.partNumber} +${item.quantity}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to release stock for ${item.productId}: ${error.message}`,
        );
        results.push({
          productId: item.productId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return {
      quotationNumber: quotation.quotationNumber,
      totalItems: quotation.items.length,
      results,
      successful: results.filter((r) => r.status === 'released').length,
      failed: results.filter((r) => r.status !== 'released').length,
    };
  }

  /**
   * Check stock availability for quotation items
   */
  async checkStockAvailability(quotationId: string) {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['items', 'items.product'],
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    const results = [];

    for (const item of quotation.items) {
      const inventory = await this.inventoryRepo.findOne({
        where: { productId: item.productId },
      });

      results.push({
        productId: item.productId,
        partNumber: item.product.partNumber,
        partName: item.product.partName,
        required: item.quantity,
        available: inventory?.quantity || 0,
        status: inventory?.quantity >= item.quantity ? 'available' : 'insufficient',
        shortage:
          inventory?.quantity < item.quantity
            ? item.quantity - inventory.quantity
            : 0,
      });
    }

    return {
      quotationNumber: quotation.quotationNumber,
      items: results,
      allAvailable: results.every((r) => r.status === 'available'),
      insufficientItems: results.filter((r) => r.status === 'insufficient'),
    };
  }

  private calculateStatus(
    quantity: number,
    safetyStock: number,
    reorderPoint: number,
  ): string {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= reorderPoint) return 'critical';
    if (quantity <= safetyStock) return 'low';
    return 'sufficient';
  }
}
