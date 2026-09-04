import { apiClient } from './client';
import { DetectionEvent } from '../types';

function normalizeEvent(e: any): DetectionEvent {
  const rawIdentifier = e.identifier?.raw || e.identifier?.normalized || 'GJ01AB1234';
  return {
    event_id: e.event_id,
    event_type: e.event_type || 'ANPR',
    camera_id: e.camera_id,
    camera_name: e.camera_name || `Camera ${e.camera_id}`,
    camera_code: e.camera_code || e.camera_id,
    department_name: e.department_name || 'Gujarat Police Traffic Branch',
    occurred_at: e.occurred_at,
    identifier: {
      type: e.identifier?.type || 'vehicle_plate',
      raw: rawIdentifier,
      normalized: e.identifier?.normalized || rawIdentifier,
      confidence: e.confidence ?? e.identifier?.confidence ?? 0.95,
    },
    location: {
      lat: e.latitude || e.location?.lat || 23.0225,
      lon: e.longitude || e.location?.lon || 72.5714,
    },
    evidence: e.evidence_ref || e.evidence || {},
    pipeline: e.pipeline || {
      node_id: 'node-sg-01',
      model_version: 'yolo-v11-anpr-v2',
      quality_state: 'Normal',
    },
  };
}

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
    const res = await apiClient.get('/events', {
      params: {
        camera_id: params?.camera_id,
        event_type: params?.event_type,
        from: params?.from,
        to: params?.to,
        skip: params?.offset || 0,
        limit: params?.limit || 50,
      },
    });

    const rawList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    let filtered = rawList.map(normalizeEvent);

    if (params?.search_plate) {
      const q = params.search_plate.toUpperCase().replace(/\s+/g, '');
      filtered = filtered.filter((ev: DetectionEvent) =>
        ev.identifier.normalized.toUpperCase().replace(/\s+/g, '').includes(q)
      );
    }

    return {
      items: filtered,
      total: filtered.length,
    };
  },

  async getEventById(id: string): Promise<DetectionEvent> {
    const res = await apiClient.get(`/events/${id}`);
    return normalizeEvent(res.data);
  },
};
