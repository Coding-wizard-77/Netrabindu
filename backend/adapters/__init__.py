try:
    from backend.adapters.base import (
        VMSAdapter, ConnectionResult, RemoteCamera, StreamDescriptor, HealthStatus, RemoteEvent
    )
    from backend.adapters.generic_rtsp import GenericRTSPAdapter
    from backend.adapters.onvif import ONVIFAdapter
    from backend.adapters.vendors.hikvision import HikvisionISAPIAdapter
    from backend.adapters.vendors.milestone import MilestoneXProtectAdapter
except ImportError:
    from adapters.base import (
        VMSAdapter, ConnectionResult, RemoteCamera, StreamDescriptor, HealthStatus, RemoteEvent
    )
    from adapters.generic_rtsp import GenericRTSPAdapter
    from adapters.onvif import ONVIFAdapter
    from adapters.vendors.hikvision import HikvisionISAPIAdapter
    from adapters.vendors.milestone import MilestoneXProtectAdapter

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
