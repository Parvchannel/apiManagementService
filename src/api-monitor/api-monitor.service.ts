import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateApiMonitorDto } from './dto/create-api-monitor.dto';
import {
  ApiMonitor,
  MonitorCheckResult,
  MonitorStatus,
} from './entities/api-monitor.entity';

const DEFAULT_INTERVAL_MS = 30_000;
const MIN_INTERVAL_MS = 5_000;
const MAX_HISTORY = 50;

@Injectable()
export class ApiMonitorService implements OnModuleDestroy {
  private readonly monitors = new Map<string, ApiMonitor>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  onModuleDestroy() {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  create(createDto: CreateApiMonitorDto): ApiMonitor {
    const url = createDto.url?.trim();
    if (!url) {
      throw new BadRequestException('url is required');
    }

    try {
      new URL(url);
    } catch {
      throw new BadRequestException('url must be a valid URL');
    }

    const intervalMs = createDto.intervalMs ?? DEFAULT_INTERVAL_MS;
    if (intervalMs < MIN_INTERVAL_MS) {
      throw new BadRequestException(
        `intervalMs must be at least ${MIN_INTERVAL_MS}`,
      );
    }

    const monitor: ApiMonitor = {
      id: randomUUID(),
      url,
      intervalMs,
      isActive: true,
      status: 'pending',
      checkHistory: [],
      createdAt: new Date(),
    };

    this.monitors.set(monitor.id, monitor);
    void this.runCheck(monitor.id);

    const timer = setInterval(() => {
      void this.runCheck(monitor.id);
    }, intervalMs);

    this.timers.set(monitor.id, timer);
    return monitor;
  }

  findAll(): ApiMonitor[] {
    return Array.from(this.monitors.values());
  }

  findOne(id: string): ApiMonitor {
    const monitor = this.monitors.get(id);
    if (!monitor) {
      throw new NotFoundException(`Monitor with id "${id}" not found`);
    }
    return monitor;
  }

  remove(id: string): void {
    const monitor = this.monitors.get(id);
    if (!monitor) {
      throw new NotFoundException(`Monitor with id "${id}" not found`);
    }

    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }

    this.monitors.delete(id);
  }

  private async runCheck(id: string): Promise<void> {
    const monitor = this.monitors.get(id);
    if (!monitor || !monitor.isActive) {
      return;
    }

    const result = await this.checkUrl(monitor.url);
    monitor.status = result.status;
    monitor.lastCheckedAt = result.checkedAt;
    monitor.lastStatusCode = result.statusCode;
    monitor.lastResponseTimeMs = result.responseTimeMs;
    monitor.lastError = result.error;

    monitor.checkHistory.unshift(result);
    if (monitor.checkHistory.length > MAX_HISTORY) {
      monitor.checkHistory.length = MAX_HISTORY;
    }
  }

  private async checkUrl(url: string): Promise<MonitorCheckResult> {
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      });

      const responseTimeMs = Date.now() - startedAt;
      const status: MonitorStatus = response.ok ? 'up' : 'down';

      return {
        checkedAt: new Date(),
        status,
        statusCode: response.status,
        responseTimeMs,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        checkedAt: new Date(),
        status: 'down',
        responseTimeMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }
}
