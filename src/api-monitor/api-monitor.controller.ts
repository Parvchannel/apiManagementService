import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { CreateApiMonitorDto } from './dto/create-api-monitor.dto';

@Controller('api-monitors')
export class ApiMonitorController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  @Post()
  create(@Body() createDto: CreateApiMonitorDto) {
    return this.apiMonitorService.create(createDto);
  }

  @Get()
  findAll() {
    return this.apiMonitorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiMonitorService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.apiMonitorService.remove(id);
    return { message: 'Monitor stopped and removed successfully' };
  }
}
