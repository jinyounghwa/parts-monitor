import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('api/queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('scraping')
  async getScrapingQueue() {
    return this.queueService.getScrapingQueues();
  }

  @Get('notification')
  async getNotificationQueue() {
    return this.queueService.getNotificationQueues();
  }

  @Get()
  async getAllQueues() {
    const [scraping, notification] = await Promise.all([
      this.queueService.getScrapingQueues(),
      this.queueService.getNotificationQueues(),
    ]);

    return {
      scraping,
      notification,
    };
  }

  @Post(':queueName/add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createJob(@Param('queueName') queueName: string, @Body() body: any) {
    return this.queueService.createJob(queueName, body);
  }

  @Post(':queueName/:jobId/retry')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async retryJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    return this.queueService.retryFailedJob(queueName, jobId);
  }

  @Delete(':queueName/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    return this.queueService.deleteJob(queueName, jobId);
  }

  @Delete(':queueName')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async clearQueue(@Param('queueName') queueName: string) {
    return this.queueService.clearQueue(queueName);
  }
}
