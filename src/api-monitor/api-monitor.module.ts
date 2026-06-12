import { Module } from '@nestjs/common';
import { ApiMonitorController } from './api-monitor.controller';
import { ApiMonitorService } from './api-monitor.service';

@Module({
  controllers: [ApiMonitorController],
  providers: [ApiMonitorService],
})
export class ApiMonitorModule {}
