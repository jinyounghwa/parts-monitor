import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerHistoryService } from './customer-history.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly historyService: CustomerHistoryService,
  ) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }

  @Get(':id/quotations')
  async getQuotationHistory(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.historyService.getQuotationHistory(
      id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.historyService.getCustomerStats(id);
  }

  @Get(':id/activity')
  async getActivity(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.historyService.getRecentActivity(
      id,
      limit ? Number(limit) : 10,
    );
  }

  @Get(':id/top-products')
  async getTopProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.historyService.getTopProducts(
      id,
      limit ? Number(limit) : 10,
    );
  }

  @Get(':id/timeline')
  async getTimeline(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.historyService.getCustomerTimeline(
      id,
      limit ? Number(limit) : 20,
    );
  }
}
