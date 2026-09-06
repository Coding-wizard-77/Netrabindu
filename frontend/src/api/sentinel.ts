import { apiClient } from './client';

export interface IngestCameraItem {
  id: string;
  camera_code: string;
  name: string;
  department_code: string;
  department_name: string;
  latitude: number;
  longitude: number;
  address: string;
  live_status: string;
  stream_properties: {
    codec: string;
    resolution: string;
    fps: number;
    bitrate_kbps: number;
    transport: string;
    pts_timing_valid: boolean;
  };
  rtsp_url: string;
  hls_url: string;
  stream_url: string;
}

export interface IngestCatalogResponse {
  total_cameras: number;
  departments: string[];
  catalogue: IngestCameraItem[];
  timestamp: string;
  sandbox_host: string;
}

export interface ChecklistItem {
  id: string;
  rule_number: number;
  title: string;
  description: string;
  passed: boolean;
  detail: string;
}

export interface PreSubmissionChecklistReport {
  overall_compliance: boolean;
  total_passed: number;
  total_rules: number;
  items: ChecklistItem[];
  timestamp: string;
  system_status: string;
}

export interface StreamValidationResult {
  valid: boolean;
  status: string;
  camera_id?: string;
  endpoint: string;
  transport: string;
  codec: string;
  resolution?: string;
  measured_latency_ms: number;
  pts_extracted: boolean;
  h265_supported: boolean;
  error?: string;
  timestamp: string;
}

export interface HackathonOutputReport {
  report_id: string;
  generated_at: string;
  jurisdiction: string;
  designated_vehicle_plate: string;
  vehicle_details: Record<string, any>;
  total_sightings: number;
  unique_cameras: number;
  departments_involved: string[];
  total_distance_km: number;
  average_speed_kmh: number;
  timeline: Array<{
    sequence: number;
    event_id: string;
    camera_id: string;
    camera_code: string;
    camera_name: string;
    department_name: string;
    latitude: number;
    longitude: number;
    occurred_at: string;
    pts_timestamp_ms: number;
    confidence: number;
    speed_estimate_kmh: number;
    thumbnail_uri?: string;
    clip_uri?: string;
  }>;
  corridor_gaps: Array<{
    from_camera: string;
    to_camera: string;
    from_time: string;
    to_time: string;
    gap_duration_minutes: number;
    distance_km: number;
    reason: string;
  }>;
  section_65b_digest: string;
  compliance_certification: string;
}

export const sentinelApi = {
  async getIngestCatalog(): Promise<IngestCatalogResponse> {
    const res = await apiClient.get('/ingest');
    return res.data;
  },

  async getChecklist(): Promise<PreSubmissionChecklistReport> {
    const res = await apiClient.get('/sentinel/checklist');
    return res.data;
  },

  async validateStream(cameraId?: string, endpoint?: string): Promise<StreamValidationResult> {
    const res = await apiClient.post('/sentinel/validate-stream', {
      camera_id: cameraId,
      endpoint,
      transport: 'tcp',
    });
    return res.data;
  },

  async getOutputReport(plate: string): Promise<HackathonOutputReport> {
    const res = await apiClient.get(`/vehicles/${encodeURIComponent(plate)}/report`);
    return res.data;
  },
};
