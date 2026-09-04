import { apiClient } from './client';
import { Alert, AlertState, AlertSeverity } from '../types';

export const alertsApi = {
  async getAlerts(params?: {
    state?: AlertState;
    severity?: AlertSeverity;
    department_id?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const res = await apiClient.get('/alerts', { params });
    return res.data;
  },

  async getAlertById(id: string): Promise<Alert> {
    const res = await apiClient.get(`/alerts/${id}`);
    return res.data;
  },

  async acknowledgeAlert(id: string, notes?: string): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/acknowledge`, { operator_notes: notes });
    return res.data;
  },

  async dispatchAlert(id: string, data: { assigned_unit: string; operator_notes?: string }): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/dispatch`, data);
    return res.data;
  },

  async resolveAlert(id: string, data: { resolution_reason: string; is_false_positive?: boolean }): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/resolve`, data);
    return res.data;
  },
};
