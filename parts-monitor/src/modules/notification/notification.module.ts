import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SESService } from './ses.service';
import { EmailService } from './email.service';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationController } from './notification.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notification' }),
    ProductModule,
  ],
  providers: [SESService, EmailService, NotificationProcessor],
  controllers: [NotificationController],
  exports: [EmailService],
})
export class NotificationModule {}
