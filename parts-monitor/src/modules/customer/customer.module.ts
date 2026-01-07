import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerHistoryService } from './customer-history.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { Quotation } from '../quotation/entities/quotation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Quotation])],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerHistoryService],
  exports: [CustomerService, CustomerHistoryService],
})
export class CustomerModule {}
