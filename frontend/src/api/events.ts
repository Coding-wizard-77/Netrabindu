import { apiClient } from './client';
import { DetectionEvent } from '../types';

function normalizeEvent(e: any): DetectionEvent {
  const plateCandidate = e.identifier?.raw || e.identifier?.normalized || e.raw_plate || e.normalized_plate || '';
  const cleanPlate = (!plateCandidate || plateCandidate === 'UNKNOWN' || plateCandidate === 'UNDEFINED')
    ? ''
    : plateCandidate.toUpperCase().replace(/\s+/g, '');
  const eventId = e.event_id || `evt_${Date.now()}`;

  return {
    event_id: eventId,
    event_type: e.event_type || 'ANPR',
    camera_id: e.camera_id || 'cam-01',
    camera_name: e.camera_name || `Camera ${e.camera_id || 'CAM-01'}`,
    camera_code: e.camera_code || e.camera_id || 'GJ-POL-CAM-01',
    department_name: e.department_name || 'Gujarat Police Traffic Branch',
    occurred_at: e.occurred_at || new Date().toISOString(),
    identifier: {
      type: e.identifier?.type || 'vehicle_plate',
      raw: cleanPlate,
      normalized: cleanPlate,
      confidence: e.confidence ?? e.identifier?.confidence ?? 0.98,
    },
    location: {
      lat: e.latitude || e.location?.lat || 23.0225,
      lon: e.longitude || e.location?.lon || 72.5714,
    },
    evidence: {
      thumbnail_uri: (e.evidence_ref?.thumbnail_uri || e.evidence?.thumbnail_uri || `/evidence/thumbnails/${eventId}.jpg`),
      plate_crop_uri: (e.evidence_ref?.plate_crop_uri || e.evidence?.plate_crop_uri || `/evidence/crops/${eventId}_plate.jpg`),
      vehicle_crop_uri: (e.evidence_ref?.vehicle_crop_uri || e.evidence?.vehicle_crop_uri || `/evidence/crops/${eventId}_vehicle.jpg`),
      clip_uri: (e.evidence_ref?.clip_uri || e.evidence?.clip_uri || `/evidence/clips/${eventId}.mp4`),
    },
    pipeline: e.pipeline || {
      node_id: 'node-sg-01',
      model_version: 'yolo-v11-anpr-v2',
      quality_state: 'Active',
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
        search_plate: params?.search_plate,
        from: params?.from,
        to: params?.to,
        skip: params?.offset || 0,
        limit: params?.limit || 50,
      },
    });

    const rawList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    let filtered = rawList
      .map(normalizeEvent)
      .filter((ev: DetectionEvent) => ev.identifier.normalized && ev.identifier.normalized !== 'UNKNOWN');

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

  async interceptPlate(plate: string, cameraId?: string): Promise<DetectionEvent> {
    const res = await apiClient.post('/events/intercept', {
      plate: plate.trim().toUpperCase(),
      camera_id: cameraId,
    });
    return normalizeEvent(res.data);
  },

  async getEventById(id: string): Promise<DetectionEvent> {
    const res = await apiClient.get(`/events/${id}`);
    return normalizeEvent(res.data);
  },
};
