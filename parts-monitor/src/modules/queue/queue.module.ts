import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'scraping' },
      { name: 'notification' },
    ),
  ],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
