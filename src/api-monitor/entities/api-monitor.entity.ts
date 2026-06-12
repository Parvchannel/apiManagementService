export type MonitorStatus = 'up' | 'down' | 'pending';

export interface MonitorCheckResult {
  checkedAt: Date;
  status: MonitorStatus;
  statusCode?: number;
  responseTimeMs: number;
  error?: string;
}

export class ApiMonitor {
  id: string;
  url: string;
  intervalMs: number;
  isActive: boolean;
  status: MonitorStatus;
  lastCheckedAt?: Date;
  lastStatusCode?: number;
  lastResponseTimeMs?: number;
  lastError?: string;
  checkHistory: MonitorCheckResult[];
  createdAt: Date;
}
