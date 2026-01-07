import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';

@Controller('api/notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly emailService: EmailService) {}

  @Post('daily-report')
  async sendDailyReport(@Body() body: { recipients: string[]; reportData: any }) {
    try {
      await this.emailService.sendDailyReport(body.recipients, body.reportData);
      return {
        success: true,
        message: 'Daily report sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('price-alert')
  async sendPriceAlert(@Body() body: { recipients: string[]; alertData: any }) {
    try {
      await this.emailService.sendPriceAlert(body.recipients, body.alertData);
      return {
        success: true,
        message: 'Price alert sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('stock-alert')
  async sendStockAlert(@Body() body: { recipients: string[]; alertData: any }) {
    try {
      await this.emailService.sendStockAlert(body.recipients, body.alertData);
      return {
        success: true,
        message: 'Stock alert sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('low-stock-alert')
  async sendLowStockAlert(@Body() body: { recipients: string[]; inventories: any[] }) {
    try {
      await this.emailService.sendLowStockAlert({
        to: body.recipients,
        inventories: body.inventories,
      });
      return {
        success: true,
        message: 'Low stock alert sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
