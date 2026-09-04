// Common & System Types
export type QualityState = 'Idle' | 'Normal' | 'Active' | 'Critical';
export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN' | 'TESTING';
export type AnalyticsProfile = 'ANPR' | 'VEHICLE' | 'PERSON' | 'NONE' | 'CUSTOM';
export type SourceType = 'DIRECT_RTSP' | 'ONVIF' | 'VMS';
export type SourceProtocol = 'RTSP' | 'ONVIF' | 'SDK' | 'API';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertState = 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type WatchlistCategory = 'STOLEN_VEHICLE' | 'WANTED_SUSPECT' | 'TRAFFIC_OFFENDER' | 'VIP_ESCORT' | 'SURVEILLANCE' | 'CUSTOM';

export interface LocationPoint {
  lat: number;
  lon: number;
}

// User & Department Types
export interface Department {
  id: string;
  code: string;
  name: string;
  jurisdiction?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
  id: string;
  username: string;
  email?: string;
  department_id: string;
  department_name?: string;
  role: 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'OPERATOR' | 'AUDITOR';
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Camera Registry Models
export interface CameraSource {
  id: string;
  camera_id: string;
  source_kind: SourceType;
  endpoint: string;
  username?: string;
  enabled: boolean;
}

export interface CameraAdaptiveProfile {
  camera_id: string;
  quality_states: string[];
  activity_thresholds: {
    idle_to_normal: number;
    normal_to_active: number;
    active_to_critical: number;
  };
  cooldown_seconds: number;
  pre_event_buffer_seconds: number;
  current_state: QualityState;
  escalation_reason?: string;
  last_state_change: string;
}

export interface CameraHealth {
  camera_id: string;
  last_seen: string;
  state: CameraStatus;
  latency_ms: number;
  fps: number;
  bitrate_kbps: number;
  failure_reason?: string;
}

export interface Camera {
  id: string;
  camera_code: string;
  name: string;
  department_id: string;
  department_code?: string;
  department_name?: string;
  location: LocationPoint;
  address?: string;
  vendor: string;
  model: string;
  source_type: SourceType;
  protocol: SourceProtocol;
  status: CameraStatus;
  analytics_profile: AnalyticsProfile;
  retention_days: number;
  endpoint_ref?: string;
  created_at: string;
  updated_at: string;
  // Dynamic telemetry fields
  current_quality_state?: QualityState;
  fps?: number;
  bitrate_kbps?: number;
  latency_ms?: number;
  failure_reason?: string;
}

export interface CameraValidationResult {
  camera_id?: string;
  status: 'SUCCESS' | 'FAILED';
  codec?: string;
  resolution?: string;
  fps?: number;
  bitrate_kbps?: number;
  audio_present?: boolean;
  probe_latency_ms?: number;
  error?: string;
}

export interface ONVIFDevice {
  device_id: string;
  ip: string;
  port: number;
  vendor: string;
  model: string;
  stream_uris: string[];
  mac_address?: string;
}

export interface StreamSessionResponse {
  camera_id: string;
  stream_type: 'webrtc' | 'hls';
  webrtc_url?: string;
  hls_url?: string;
  session_token: string;
  expires_at: string;
  stream_info: {
    codec: string;
    resolution: string;
    fps: number;
  };
}

// AI Detections & Evidence Contracts
export interface DetectionIdentifier {
  type: 'vehicle_plate' | 'person_candidate' | 'vehicle_track' | 'object';
  raw: string;
  normalized: string;
  confidence: number;
}

export interface DetectionEvidence {
  thumbnail_uri?: string;
  clip_uri?: string;
  plate_crop_uri?: string;
  vehicle_crop_uri?: string;
}

export interface DetectionPipelineInfo {
  node_id: string;
  model_version: string;
  source_frame_time?: string;
  quality_state: QualityState;
  inference_tier?: string;
  escalation_reason?: string;
}

export interface DetectionEvent {
  event_id: string;
  event_type: 'ANPR' | 'PERSON_REID' | 'VEHICLE' | 'OBJECT';
  camera_id: string;
  camera_name?: string;
  camera_code?: string;
  department_name?: string;
  occurred_at: string;
  identifier: DetectionIdentifier;
  location: LocationPoint;
  evidence: DetectionEvidence;
  pipeline: DetectionPipelineInfo;
}

// Watchlist & Matcher Contracts
export interface WatchlistEntity {
  id: string;
  entity_type: 'VEHICLE' | 'PERSON';
  identifier: string;
  normalized_identifier: string;
  category: WatchlistCategory;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source_ref?: string; // FIR number, eGujCop, VAHAN, etc.
  notes?: string;
  department_id?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface WatchlistMatchCandidate {
  entity_id: string;
  identifier: string;
  category: WatchlistCategory;
  priority: string;
  similarity_score: number;
  ocr_confidence: number;
  is_strong_match: boolean;
  requires_review: boolean;
  reason: string;
}

// Alerts Contracts
export interface Alert {
  id: string;
  event_id: string;
  entity_id?: string;
  severity: AlertSeverity;
  state: AlertState;
  watchlist_category: string;
  target_identifier: string;
  detected_identifier: string;
  confidence: number;
  camera_id: string;
  camera_name: string;
  camera_code: string;
  department_name: string;
  location: LocationPoint;
  occurred_at: string;
  created_at: string;
  acknowledged_at?: string;
  dispatched_at?: string;
  resolved_at?: string;
  operator_notes?: string;
  assigned_unit?: string;
  evidence: DetectionEvidence;
  quality_state_at_capture?: QualityState;
}

// Vehicle Timeline & Route Reconstruction Contracts
export interface VehicleRoutePoint {
  sequence: number;
  event_id: string;
  camera_id: string;
  camera_code: string;
  camera_name: string;
  department_name: string;
  location: LocationPoint;
  occurred_at: string;
  confidence: number;
  raw_plate: string;
  normalized_plate: string;
  thumbnail_uri?: string;
  clip_uri?: string;
  speed_estimate_kmh?: number;
  gap_warning_minutes?: number; // Flag for explicit unobserved interval
}

export interface VehicleRouteResponse {
  plate: string;
  normalized_plate: string;
  from_time: string;
  to_time: string;
  total_sightings: number;
  unique_cameras: number;
  points: VehicleRoutePoint[];
}

// Health, Metrics & Telemetry
export interface EdgeNodeTelemetry {
  node_id: string;
  region: string;
  active_cameras: number;
  idle_cameras: number;
  normal_cameras: number;
  critical_cameras: number;
  sentinel_trigger_rate_per_min: number;
  avg_inference_latency_ms: number;
  bandwidth_saved_mbps: number;
  compute_savings_percent: number;
  quality_switches_last_hour: number;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface SystemMetrics {
  total_cameras: number;
  online_cameras: number;
  offline_cameras: number;
  degraded_cameras: number;
  unknown_cameras: number;
  events_per_minute: number;
  active_critical_alerts: number;
  active_high_alerts: number;
  total_alerts_today: number;
  event_bus_lag_ms: number;
  db_pool_active: number;
  db_pool_available: number;
  storage_usage_gb: number;
  edge_nodes: EdgeNodeTelemetry[];
}

export interface ExternalIntegrationHealth {
  name: string;
  display_name: string;
  type: 'VAHAN' | 'SARTHI' | 'EGUJCOP' | 'AFIS' | 'NAFIS';
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'OFFLINE';
  schema_version: string;
  base_url: string;
  last_heartbeat: string;
  lookup_latency_ms: number;
  is_live_connected: boolean;
}

// Audit Log Contracts
export interface AuditLogEntry {
  id: string;
  actor_username: string;
  actor_id: string;
  department_code?: string;
  action: 'LOGIN' | 'STREAM_VIEW' | 'EVIDENCE_ACCESS' | 'WATCHLIST_CREATE' | 'WATCHLIST_UPDATE' | 'ALERT_ACKNOWLEDGE' | 'ALERT_DISPATCH' | 'ALERT_RESOLVE' | 'CAMERA_ONBOARD' | 'ROUTE_SEARCH' | 'EXPORT_REPORT';
  target_resource: string;
  target_id: string;
  timestamp: string;
  ip_address: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: Record<string, any>;
}

// WebSocket Event Payloads
export type WebSocketMessageType = 'ALERT' | 'DETECTION' | 'CAMERA_HEALTH' | 'ADAPTIVE_TELEMETRY';

export interface WebSocketMessage<T = any> {
  topic: string;
  type: WebSocketMessageType;
  timestamp: string;
  payload: T;
}
