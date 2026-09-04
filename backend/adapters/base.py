from typing import Protocol, runtime_checkable, List, Optional, AsyncIterator, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class ConnectionResult:
    success: bool
    latency_ms: float = 0.0
    error_message: Optional[str] = None
    server_info: Optional[Dict[str, Any]] = None

@dataclass
class RemoteCamera:
    external_id: str
    name: str
    model: Optional[str] = None
    vendor: Optional[str] = None
    ip_address: Optional[str] = None
    rtsp_url: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)

@dataclass
class StreamDescriptor:
    camera_id: str
    stream_uri: str
    protocol: str = "RTSP"
    codec: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[float] = None
    bitrate_kbps: Optional[float] = None
    audio_present: bool = False
    auth_header: Optional[str] = None

@dataclass
class HealthStatus:
    camera_id: str
    state: str  # ONLINE, OFFLINE, DEGRADED, UNKNOWN
    latency_ms: float
    fps: float
    bitrate_kbps: float
    error_reason: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)

@dataclass
class RemoteEvent:
    event_id: str
    external_camera_id: str
    event_type: str
    occurred_at: datetime
    data: Dict[str, Any]

@runtime_checkable
class VMSAdapter(Protocol):
    """Normalized interface for heterogeneous VMS and camera sources."""
    name: str

    async def test_connection(self) -> ConnectionResult:
        """Test reachability and authentication to the source/VMS."""
        ...

    async def list_cameras(self) -> List[RemoteCamera]:
        """Discover and list all cameras exposed by this VMS."""
        ...

    async def get_stream(self, remote_camera_id: str) -> StreamDescriptor:
        """Retrieve stream descriptor and access URL for a specific camera."""
        ...

    async def get_health(self, remote_camera_id: str) -> HealthStatus:
        """Query real-time health and feed state of a camera."""
        ...

    async def subscribe_events(self) -> AsyncIterator[RemoteEvent]:
        """Stream real-time VMS events asynchronously."""
        ...
