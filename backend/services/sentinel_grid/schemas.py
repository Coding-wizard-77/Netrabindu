from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StreamProperties(BaseModel):
    codec: str = "H.264" # H.264 or H.265
    resolution: str = "1920x1080"
    fps: float = 25.0
    bitrate_kbps: float = 2048.0
    transport: str = "tcp"
    pts_timing_valid: bool = True

class IngestCameraItem(BaseModel):
    id: str
    camera_code: str
    name: str
    department_code: str
    department_name: str
    latitude: float
    longitude: float
    address: str
    live_status: str = "ONLINE"
    stream_properties: StreamProperties
    rtsp_url: str
    hls_url: str
    stream_url: str # Browser playback fallback

class IngestCatalogResponse(BaseModel):
    total_cameras: int
    departments: List[str]
    catalogue: List[IngestCameraItem]
    timestamp: str
    sandbox_host: str

class StreamValidationRequest(BaseModel):
    camera_id: Optional[str] = None
    endpoint: Optional[str] = None
    protocol: str = "RTSP"
    transport: str = "tcp"
    timeout_seconds: float = 5.0

class StreamValidationResult(BaseModel):
    valid: bool
    status: str
    camera_id: Optional[str] = None
    endpoint: str
    transport: str = "tcp"
    codec: str
    resolution: Optional[str] = None
    measured_latency_ms: float
    pts_extracted: bool
    h265_supported: bool
    error: Optional[str] = None
    timestamp: str

class ChecklistItem(BaseModel):
    id: str
    rule_number: int
    title: str
    description: str
    passed: bool
    detail: str

class PreSubmissionChecklistReport(BaseModel):
    overall_compliance: bool
    total_passed: int
    total_rules: int
    items: List[ChecklistItem]
    timestamp: str
    system_status: str

class VehicleSightingItem(BaseModel):
    sequence: int
    event_id: str
    camera_id: str
    camera_code: str
    camera_name: str
    department_name: str
    latitude: float
    longitude: float
    occurred_at: str
    pts_timestamp_ms: float
    confidence: float
    speed_estimate_kmh: float
    thumbnail_uri: Optional[str] = None
    clip_uri: Optional[str] = None

class TransitGapItem(BaseModel):
    from_camera: str
    to_camera: str
    from_time: str
    to_time: str
    gap_duration_minutes: float
    distance_km: float
    reason: str

class HackathonOutputReport(BaseModel):
    report_id: str
    generated_at: str
    jurisdiction: str
    designated_vehicle_plate: str
    vehicle_details: Dict[str, Any]
    total_sightings: int
    unique_cameras: int
    departments_involved: List[str]
    total_distance_km: float
    average_speed_kmh: float
    timeline: List[VehicleSightingItem]
    corridor_gaps: List[TransitGapItem]
    section_65b_digest: str
    compliance_certification: str
