from typing import Dict, Any, Optional
from backend.adapters.base import VMSAdapter
from backend.adapters.generic_rtsp import GenericRTSPAdapter
from backend.adapters.onvif import ONVIFAdapter
from backend.adapters.vendors.hikvision import HikvisionISAPIAdapter
from backend.adapters.vendors.milestone import MilestoneXProtectAdapter

class VMSFederationManager:
    """Factory and registry manager for heterogeneous VMS and camera sources."""

    @staticmethod
    def get_adapter(
        source_type: str,
        endpoint: str,
        username: Optional[str] = None,
        password: Optional[str] = None
    ) -> VMSAdapter:
        st = source_type.upper()
        if st in ("DIRECT_RTSP", "RTSP"):
            return GenericRTSPAdapter(endpoint=endpoint, username=username, password=password)
        elif st == "ONVIF":
            # Extract host and port
            from urllib.parse import urlparse
            p = urlparse(endpoint if "://" in endpoint else f"http://{endpoint}")
            host = p.hostname or endpoint
            port = p.port or 80
            return ONVIFAdapter(host=host, port=port, username=username, password=password)
        elif st in ("HIKVISION", "HIKVISION_ISAPI"):
            from urllib.parse import urlparse
            p = urlparse(endpoint if "://" in endpoint else f"http://{endpoint}")
            host = p.hostname or endpoint
            port = p.port or 80
            return HikvisionISAPIAdapter(host=host, port=port, username=username, password=password)
        elif st in ("MILESTONE", "MILESTONE_XPROTECT"):
            from urllib.parse import urlparse
            p = urlparse(endpoint if "://" in endpoint else f"https://{endpoint}")
            host = p.hostname or endpoint
            port = p.port or 443
            return MilestoneXProtectAdapter(host=host, port=port, username=username, password=password)
        else:
            return GenericRTSPAdapter(endpoint=endpoint, username=username, password=password)
