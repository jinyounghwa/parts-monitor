import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('api/health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  getHealth() {
    return this.monitoringService.getHealthStatus();
  }
}
