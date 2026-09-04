import { apiClient } from './client';
import { DetectionEvent } from '../types';

export const eventsApi = {
  async getEvents(params?: {
    event_type?: string;
    camera_id?: string;
    from?: string;
    to?: string;
    min_confidence?: number;
    search_plate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: DetectionEvent[]; total: number }> {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },

  async getEventById(id: string): Promise<DetectionEvent> {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
};
