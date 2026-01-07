import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { UpdateSafetyStockDto } from './dto/update-safety-stock.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockTransaction)
    private transactionRepo: Repository<StockTransaction>,
  ) {}

  async getInventoryStatus() {
    const inventories = await this.inventoryRepo.find({
      relations: ['product', 'warehouse'],
      order: { lastUpdated: 'DESC' },
    });

    return inventories.map((inv) => ({
      ...inv,
      status: this.calculateStatus(inv.quantity, inv.safetyStock, inv.reorderPoint),
    }));
  }

  async findOne(productId: string, warehouseId?: string) {
    const where: any = { productId };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const inventory = await this.inventoryRepo.findOne({
      where,
      relations: ['product', 'warehouse'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async stockIn(data: StockInDto) {
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const inventory = await this.inventoryRepo.findOne({
      where: {
        productId: data.productId,
        warehouseId: data.warehouseId,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const beforeQuantity = inventory.quantity;
    const afterQuantity = beforeQuantity + data.quantity;

    inventory.quantity = afterQuantity;
    inventory.status = this.calculateStatus(
      afterQuantity,
      inventory.safetyStock,
      inventory.reorderPoint,
    );
    await this.inventoryRepo.save(inventory);

    const transaction = this.transactionRepo.create({
      productId: data.productId,
      warehouseId: data.warehouseId,
      type: 'IN',
      quantity: data.quantity,
      beforeQuantity,
      afterQuantity,
      unitPrice: data.unitPrice,
      reference: data.reference,
      memo: data.memo,
      performedBy: data.performedBy,
    });

    await this.transactionRepo.save(transaction);

    this.logger.log(
      `Stock IN: ${data.productId} +${data.quantity} (${beforeQuantity} → ${afterQuantity})`,
    );

    return { inventory, transaction };
  }

  async stockOut(data: StockOutDto) {
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const inventory = await this.inventoryRepo.findOne({
      where: {
        productId: data.productId,
        warehouseId: data.warehouseId,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (inventory.quantity < data.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${inventory.quantity}, Requested: ${data.quantity}`,
      );
    }

    const beforeQuantity = inventory.quantity;
    const afterQuantity = beforeQuantity - data.quantity;

    inventory.quantity = afterQuantity;
    inventory.status = this.calculateStatus(
      afterQuantity,
      inventory.safetyStock,
      inventory.reorderPoint,
    );
    await this.inventoryRepo.save(inventory);

    const transaction = this.transactionRepo.create({
      productId: data.productId,
      warehouseId: data.warehouseId,
      type: 'OUT',
      quantity: data.quantity,
      beforeQuantity,
      afterQuantity,
      reference: data.reference,
      memo: data.memo,
      performedBy: data.performedBy,
    });

    await this.transactionRepo.save(transaction);

    this.logger.log(
      `Stock OUT: ${data.productId} -${data.quantity} (${beforeQuantity} → ${afterQuantity})`,
    );

    return { inventory, transaction };
  }

  async adjustStock(data: AdjustStockDto) {
    if (data.newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const inventory = await this.inventoryRepo.findOne({
      where: {
        productId: data.productId,
        warehouseId: data.warehouseId,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const beforeQuantity = inventory.quantity;
    const adjustmentQuantity = data.newQuantity - beforeQuantity;

    inventory.quantity = data.newQuantity;
    inventory.status = this.calculateStatus(
      data.newQuantity,
      inventory.safetyStock,
      inventory.reorderPoint,
    );
    await this.inventoryRepo.save(inventory);

    const transaction = this.transactionRepo.create({
      productId: data.productId,
      warehouseId: data.warehouseId,
      type: 'ADJUST',
      quantity: adjustmentQuantity,
      beforeQuantity,
      afterQuantity: data.newQuantity,
      memo: data.memo,
      performedBy: data.performedBy,
    });

    await this.transactionRepo.save(transaction);

    this.logger.log(
      `Stock ADJUST: ${data.productId} ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity} (${beforeQuantity} → ${data.newQuantity})`,
    );

    return { inventory, transaction };
  }

  async getTransactionHistory(productId: string, limit = 50) {
    return this.transactionRepo.find({
      where: { productId },
      relations: ['product', 'warehouse'],
      order: { transactionDate: 'DESC' },
      take: limit,
    });
  }

  async getLowStockAlerts() {
    const inventories = await this.inventoryRepo.find({
      relations: ['product', 'warehouse'],
      order: { status: 'ASC', quantity: 'ASC' },
    });

    return inventories.filter(inv =>
      ['low', 'critical', 'out_of_stock'].includes(inv.status)
    );
  }

  async updateSafetyStock(productId: string, dto: UpdateSafetyStockDto) {
    const inventory = await this.findOne(productId, dto.warehouseId);

    inventory.safetyStock = dto.safetyStock;
    inventory.reorderPoint = dto.reorderPoint;
    inventory.status = this.calculateStatus(
      inventory.quantity,
      dto.safetyStock,
      dto.reorderPoint,
    );

    return this.inventoryRepo.save(inventory);
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
