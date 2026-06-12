import { Module } from '@nestjs/common';
import { ApiMonitorModule } from './api-monitor/api-monitor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, ApiMonitorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
