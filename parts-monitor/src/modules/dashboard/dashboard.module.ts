import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Product } from '../product/entities/product.entity';
import { PriceHistory } from '../product/entities/price-history.entity';
import { ScrapingHistory } from '../product/entities/scraping-history.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockTransaction } from '../inventory/entities/stock-transaction.entity';
import { Quotation } from '../quotation/entities/quotation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      PriceHistory,
      ScrapingHistory,
      Inventory,
      StockTransaction,
      Quotation,
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
