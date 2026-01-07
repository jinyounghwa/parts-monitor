import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseService } from './warehouse.service';
import { WarehouseProductService } from './warehouse-product.service';
import { WarehouseController } from './warehouse.controller';
import { Warehouse } from './entities/warehouse.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, Inventory, Product]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseProductService],
  exports: [WarehouseService, WarehouseProductService],
})
export class WarehouseModule {}
