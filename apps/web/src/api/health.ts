import { apiClient } from './client';
import { SystemMetrics, ExternalIntegrationHealth } from '../types';

export const healthApi = {
  async getSystemHealth(): Promise<{ status: string; initialized: boolean; version: string; components: Record<string, string> }> {
    const res = await apiClient.get('/health');
    return res.data;
  },

  async getMetrics(): Promise<SystemMetrics> {
    const res = await apiClient.get('/metrics');
    return res.data;
  },

  async getIntegrations(): Promise<ExternalIntegrationHealth[]> {
    const res = await apiClient.get('/integrations/health');
    return res.data;
  },
};
