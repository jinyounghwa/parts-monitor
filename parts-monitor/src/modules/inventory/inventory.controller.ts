import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { UpdateSafetyStockDto } from './dto/update-safety-stock.dto';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventoryStatus() {
    return this.inventoryService.getInventoryStatus();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string, @Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.findOne(productId, warehouseId);
  }

  @Post('stock-in')
  stockIn(@Body() stockInDto: StockInDto) {
    return this.inventoryService.stockIn(stockInDto);
  }

  @Post('stock-out')
  stockOut(@Body() stockOutDto: StockOutDto) {
    return this.inventoryService.stockOut(stockOutDto);
  }

  @Post('adjust')
  adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    return this.inventoryService.adjustStock(adjustStockDto);
  }

  @Get(':productId/transactions')
  getTransactionHistory(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getTransactionHistory(productId, limit ? parseInt(limit) : 50);
  }

  @Get('alerts/low-stock')
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Patch(':productId/safety-stock')
  updateSafetyStock(@Param('productId') productId: string, @Body() updateSafetyStockDto: UpdateSafetyStockDto) {
    return this.inventoryService.updateSafetyStock(productId, updateSafetyStockDto);
  }
}
