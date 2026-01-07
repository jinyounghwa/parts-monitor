import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('inventory-summary')
  async getInventorySummary() {
    return this.dashboardService.getInventorySummary();
  }

  @Get('price-history/:productId')
  async getProductPriceHistory(
    @Param('productId') productId: string,
    @Query('days') days?: number,
  ) {
    return this.dashboardService.getProductPriceHistory(
      productId,
      days || 30,
    );
  }

  @Get('price-histories')
  async getAllPriceHistories(@Query('days') days?: number) {
    return this.dashboardService.getAllProductPriceHistories(days || 30);
  }

  @Get('alerts')
  async getAlerts(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentAlerts(limit || 10);
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  async exportData(@Query('days') days?: number) {
    const data = await this.dashboardService.getAllProductPriceHistories(
      days || 30,
    );

    return {
      filename: `price-history-${new Date().toISOString().split('T')[0]}.json`,
      data,
    };
  }
}
