import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
