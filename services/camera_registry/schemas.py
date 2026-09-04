from pydantic import BaseModel, Field, computed_field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CameraSourceCreate(BaseModel):
    source_kind: str = "MAIN_STREAM"
    endpoint: str
    username: Optional[str] = None
    password: Optional[str] = None

class CameraAdaptiveProfileCreate(BaseModel):
    quality_states: Dict[str, Any] = Field(default_factory=lambda: {
        "idle": {"fps": 2, "resolution": "480p", "bitrate_kbps": 256},
        "normal": {"fps": 10, "resolution": "720p", "bitrate_kbps": 1024},
        "active": {"fps": 20, "resolution": "1080p", "bitrate_kbps": 2048},
        "critical": {"fps": 25, "resolution": "1080p", "bitrate_kbps": 4096}
    })
    activity_thresholds: Dict[str, Any] = Field(default_factory=lambda: {"motion_trigger": 0.35, "density_trigger": 5})
    cooldowns: Dict[str, Any] = Field(default_factory=lambda: {"state_cooldown_seconds": 30})
    pre_event_buffer_seconds: int = 10

class CameraCreate(BaseModel):
    camera_code: str
    name: str
    department_id: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    vendor: str = "Generic"
    model: str = "Standard"
    source_type: str = "DIRECT_RTSP" # DIRECT_RTSP, ONVIF, VMS
    protocol: str = "RTSP"
    endpoint: str
    username: Optional[str] = None
    password: Optional[str] = None
    retention_days: int = 15
    analytics_profile: str = "ANPR" # ANPR, VEHICLE, PERSON, NONE, CUSTOM
    adaptive_profile: Optional[CameraAdaptiveProfileCreate] = None

class CameraSourceOut(BaseModel):
    id: str
    source_kind: str
    endpoint: str
    enabled: bool

    class Config:
        from_attributes = True

class CameraOut(BaseModel):
    id: str
    camera_code: str
    name: str
    department_id: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    vendor: str
    model: str
    source_type: str
    protocol: str
    status: str
    retention_days: int
    analytics_profile: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    endpoint_ref: Optional[str] = None
    current_quality_state: Optional[str] = "Normal"
    fps: Optional[float] = 15.0
    bitrate_kbps: Optional[float] = 1024.0
    latency_ms: Optional[float] = 45.0
    sources: List[CameraSourceOut] = []

    @computed_field
    @property
    def location(self) -> Dict[str, float]:
        lat = self.latitude if self.latitude is not None else 0.0
        lon = self.longitude if self.longitude is not None else 0.0
        return {"lat": lat, "lon": lon}

    class Config:
        from_attributes = True

class CameraAdaptiveProfileOut(BaseModel):
    quality_states: Dict[str, Any] = Field(default_factory=dict)
    activity_thresholds: Dict[str, Any] = Field(default_factory=dict)
    cooldowns: Dict[str, Any] = Field(default_factory=dict)
    pre_event_buffer_seconds: int = 10

    class Config:
        from_attributes = True

class CameraCapabilityOut(BaseModel):
    capability_json: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        from_attributes = True

class CameraDetailOut(CameraOut):
    adaptive_profile: Optional[CameraAdaptiveProfileOut] = None
    capabilities: Optional[CameraCapabilityOut] = None

class ONVIFDiscoverRequest(BaseModel):
    interface_or_subnet: Optional[str] = None
    network_interface: Optional[str] = None
    timeout_seconds: float = 3.0

class CameraImportResult(BaseModel):
    imported_count: int
    failed_count: int
    cameras: List[CameraOut]
    errors: List[Dict[str, Any]]

    @computed_field
    @property
    def total(self) -> int:
        return self.imported_count + self.failed_count

    @computed_field
    @property
    def imported(self) -> int:
        return self.imported_count

    @computed_field
    @property
    def failed(self) -> int:
        return self.failed_count
