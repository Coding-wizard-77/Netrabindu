import { apiClient } from './client';
import { VehicleRouteResponse, DetectionEvidence } from '../types';

export const vehiclesApi = {
  async getTimeline(plate: string, from?: string, to?: string): Promise<VehicleRouteResponse> {
    const res = await apiClient.get(`/vehicles/${encodeURIComponent(plate)}/timeline`, {
      params: { from, to },
    });
    return res.data;
  },

  async getRoute(plate: string, from?: string, to?: string): Promise<VehicleRouteResponse> {
    const res = await apiClient.get(`/vehicles/${encodeURIComponent(plate)}/route`, {
      params: { from, to },
    });
    return res.data;
  },

  async getEvidence(plate: string, from?: string, to?: string): Promise<DetectionEvidence[]> {
    const res = await apiClient.get(`/vehicles/${encodeURIComponent(plate)}/evidence`, {
      params: { from, to },
    });
    return res.data;
  },
};
