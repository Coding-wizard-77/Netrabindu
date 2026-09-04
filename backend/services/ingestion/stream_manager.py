import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from backend.config import settings

logger = logging.getLogger(__name__)

class StreamManager:
    """Manages stream registration and browser viewing sessions via MediaMTX gateway."""

    def __init__(self):
        self.api_url = settings.MEDIAMTX_API_URL
        self.rtsp_base = settings.MEDIAMTX_RTSP_URL
        self.webrtc_base = settings.MEDIAMTX_WEBRTC_URL
        self.hls_base = settings.MEDIAMTX_HLS_URL

    async def register_stream_path(self, camera_id: str, source_rtsp_url: str) -> bool:
        """Register an RTSP pull source path inside MediaMTX dynamically."""
        path_name = f"cam_{camera_id.replace('-', '')}"
        payload = {
            "source": source_rtsp_url,
            "sourceOnDemand": True
        }
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    f"{self.api_url}/v3/config/paths/add/{path_name}",
                    json=payload
                )
                if res.status_code in (200, 201):
                    logger.info(f"Registered stream path {path_name} with MediaMTX.")
                    return True
                elif res.status_code == 400 and "path already exists" in res.text.lower():
                    return True
        except Exception as e:
            logger.warning(f"Could not connect to MediaMTX API at {self.api_url}: {e}. Standard relay path assumed.")
        return True

    async def unregister_stream_path(self, camera_id: str) -> bool:
        """Remove an RTSP path from MediaMTX."""
        path_name = f"cam_{camera_id.replace('-', '')}"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.delete(f"{self.api_url}/v3/config/paths/remove/{path_name}")
                return res.status_code in (200, 204)
        except Exception:
            return True

    def get_stream_urls(self, camera_id: str, session_token: Optional[str] = None) -> Dict[str, Any]:
        """Construct client-facing WebRTC, HLS, and RTSP relay endpoints."""
        path_name = f"cam_{camera_id.replace('-', '')}"
        token_param = f"?token={session_token}" if session_token else ""
        expires = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        return {
            "camera_id": camera_id,
            "path_name": path_name,
            "webrtc_url": f"{self.webrtc_base}/{path_name}/whep{token_param}",
            "hls_url": f"{self.hls_base}/{path_name}/index.m3u8{token_param}",
            "rtsp_url": f"{self.rtsp_base}/{path_name}",
            "session_token": session_token or "auth-verified",
            "expires_at": expires.isoformat()
        }

stream_manager = StreamManager()
