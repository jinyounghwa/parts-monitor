import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class WarehouseProductService {
  private readonly logger = new Logger(WarehouseProductService.name);

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProductsByWarehouse(
    warehouseId: string,
    status?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const where: any = { warehouseId };
    if (status) {
      where.status = status;
    }

    const [inventories, total] = await this.inventoryRepo.findAndCount({
      where,
      relations: ['product', 'warehouse'],
      order: { product: { partNumber: 'ASC' } },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      warehouseId,
      products: inventories.map((inv) => ({
        ...inv,
        product: inv.product,
        warehouse: inv.warehouse,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  async getWarehouseSummary(warehouseId: string) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const inventories = await this.inventoryRepo.find({
      where: { warehouseId },
      relations: ['product'],
    });

    const summary = {
      totalProducts: inventories.length,
      totalQuantity: inventories.reduce((sum, inv) => sum + inv.quantity, 0),
      lowStock: inventories.filter((inv) => inv.status === 'low').length,
      criticalStock: inventories.filter((inv) => inv.status === 'critical')
        .length,
      outOfStock: inventories.filter((inv) => inv.status === 'out_of_stock')
        .length,
      sufficientStock: inventories.filter((inv) => inv.status === 'sufficient')
        .length,
      totalValue: inventories.reduce(
        (sum, inv) => sum + inv.quantity * (inv.product?.standardPrice || 0),
        0,
      ),
    };

    // Get top products by value
    const topProducts = [...inventories]
      .map((inv) => ({
        ...inv,
        value: inv.quantity * (inv.product?.standardPrice || 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      warehouse,
      summary,
      topProducts,
    };
  }

  async getProductLocations(productId: string) {
    const inventories = await this.inventoryRepo.find({
      where: { productId },
      relations: ['warehouse', 'product'],
    });

    return {
      productId,
      locations: inventories.map((inv) => ({
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse?.name,
        warehouseCode: inv.warehouse?.code,
        quantity: inv.quantity,
        status: inv.status,
        location: inv.location,
        safetyStock: inv.safetyStock,
        reorderPoint: inv.reorderPoint,
      })),
      totalQuantity: inventories.reduce((sum, inv) => sum + inv.quantity, 0),
    };
  }

  async searchProductsInWarehouse(
    warehouseId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const [inventories, total] = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .where('inventory.warehouseId = :warehouseId', { warehouseId })
      .andWhere(
        '(product.partNumber ILIKE :search OR product.partName ILIKE :search OR product.specification ILIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .orderBy('product.partNumber', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return {
      warehouseId,
      searchTerm,
      products: inventories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllWarehousesProducts(status?: string) {
    const inventories = await this.inventoryRepo.find({
      relations: ['product', 'warehouse'],
      order: { warehouse: { name: 'ASC' }, product: { partNumber: 'ASC' } },
    });

    let filteredInventories = inventories;
    if (status) {
      filteredInventories = inventories.filter((inv) => inv.status === status);
    }

    // Group by warehouse
    const grouped = new Map<string, typeof inventories>();

    for (const inv of filteredInventories) {
      const warehouseName = inv.warehouse?.name || 'Unknown';
      if (!grouped.has(warehouseName)) {
        grouped.set(warehouseName, []);
      }
      grouped.get(warehouseName)!.push(inv);
    }

    return {
      status,
      warehouses: Array.from(grouped.entries()).map(([name, inventories]) => ({
        name,
        count: inventories.length,
        products: inventories,
      })),
      total: filteredInventories.length,
    };
  }
}
