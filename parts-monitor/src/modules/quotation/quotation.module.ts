import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationService } from './quotation.service';
import { QuotationInventoryService } from './quotation-inventory.service';
import { QuotationController } from './quotation.controller';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockTransaction } from '../inventory/entities/stock-transaction.entity';
import { PDFGeneratorService } from './pdf-generator.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      QuotationItem,
      Inventory,
      StockTransaction,
    ]),
    NotificationModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService, QuotationInventoryService, PDFGeneratorService],
  exports: [QuotationService, QuotationInventoryService],
})
export class QuotationModule {}
