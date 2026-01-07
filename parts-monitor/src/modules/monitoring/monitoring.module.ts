import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { HealthController } from './health.controller';

@Module({
  providers: [MonitoringService],
  controllers: [HealthController],
})
export class MonitoringModule {}
