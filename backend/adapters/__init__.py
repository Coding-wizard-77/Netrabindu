from backend.adapters.base import (
    VMSAdapter, ConnectionResult, RemoteCamera, StreamDescriptor, HealthStatus, RemoteEvent
)
from backend.adapters.generic_rtsp import GenericRTSPAdapter
from backend.adapters.onvif import ONVIFAdapter
from backend.adapters.vendors.hikvision import HikvisionISAPIAdapter
from backend.adapters.vendors.milestone import MilestoneXProtectAdapter

__all__ = [
    "VMSAdapter",
    "ConnectionResult",
    "RemoteCamera",
    "StreamDescriptor",
    "HealthStatus",
    "RemoteEvent",
    "GenericRTSPAdapter",
    "ONVIFAdapter",
    "HikvisionISAPIAdapter",
    "MilestoneXProtectAdapter"
]
