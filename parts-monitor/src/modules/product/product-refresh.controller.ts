import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductRefreshService } from './product-refresh.service';
import { ScrapingHistoryService } from './scraping-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/products')
@UseGuards(JwtAuthGuard)
export class ProductRefreshController {
  constructor(
    private readonly refreshService: ProductRefreshService,
    private readonly historyService: ScrapingHistoryService,
  ) {}

  @Post(':id/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshSingleProduct(
    @Param('id') id: string,
    @Query('triggeredBy') triggeredBy?: string,
  ) {
    return this.refreshService.refreshSingleProduct(id, triggeredBy);
  }

  @Post('refresh/multiple')
  @HttpCode(HttpStatus.OK)
  async refreshMultipleProducts(
    @Body('productIds') productIds: string[],
    @Query('triggeredBy') triggeredBy?: string,
  ) {
    return this.refreshService.refreshMultipleProducts(productIds, triggeredBy);
  }

  @Post('refresh/all')
  @HttpCode(HttpStatus.OK)
  async refreshAllProducts(@Query('triggeredBy') triggeredBy?: string) {
    return this.refreshService.refreshAllProducts(triggeredBy);
  }

  @Post('refresh/site/:site')
  @HttpCode(HttpStatus.OK)
  async refreshBySite(
    @Param('site') site: string,
    @Query('triggeredBy') triggeredBy?: string,
  ) {
    return this.refreshService.refreshBySite(site, triggeredBy);
  }

  @Get(':id/history')
  async getProductHistory(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.historyService.getProductHistory(id, limit ? Number(limit) : 20);
  }

  @Get('history/recent')
  async getRecentHistory(@Query('limit') limit?: number) {
    return this.historyService.getRecentHistory(limit ? Number(limit) : 50);
  }

  @Get('history/stats')
  async getHistoryStats(@Query('productId') productId?: string) {
    return this.historyService.getHistoryStats(productId);
  }

  @Get('history/failed')
  async getFailedAttempts(@Query('limit') limit?: number) {
    return this.historyService.getFailedAttempts(limit ? Number(limit) : 20);
  }
}
