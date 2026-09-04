import { apiClient } from './client';
import { AuditLogEntry } from '../types';

function normalizeAuditLog(l: any): AuditLogEntry {
  return {
    id: l.id,
    actor_username: l.actor || 'operator_112',
    actor_id: l.actor || 'usr_sys',
    department_code: l.department_context || 'DEPT-HQ',
    action: (l.action || 'LOGIN') as any,
    target_resource: l.target || 'CONTROL_PLANE',
    target_id: l.target || l.id,
    timestamp: l.timestamp_utc || new Date().toISOString(),
    ip_address: l.source_ip || '10.24.112.5',
    result: (l.result === 'SUCCESS' ? 'SUCCESS' : 'FAILED') as any,
    details: l.reason ? { reason: l.reason, request_id: l.request_id } : undefined,
  };
}

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
    const res = await apiClient.get('/audit', {
      params: {
        actor: params?.actor,
        action: params?.action,
        from: params?.from,
        to: params?.to,
        skip: params?.offset || 0,
        limit: params?.limit || 50,
      },
    });

    const raw = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    const items = raw.map(normalizeAuditLog);

    return {
      items,
      total: items.length,
    };
  },
};
