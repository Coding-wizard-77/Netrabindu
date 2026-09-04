import { apiClient } from './client';
import { AuditLogEntry } from '../types';

export const auditApi = {
  async getAuditLogs(params?: {
    actor?: string;
    action?: string;
    target?: string;
    result?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AuditLogEntry[]; total: number }> {
    const res = await apiClient.get('/audit', { params });
    return res.data;
  },
};
