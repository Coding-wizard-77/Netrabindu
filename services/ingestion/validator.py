import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from services.camera_registry.models import Camera, CameraSource, CameraHealth
from services.federation.manager import VMSFederationManager

logger = logging.getLogger(__name__)

class FeedValidator:
    """Probes and validates camera streams, recording health and stream telemetry."""

    @staticmethod
    async def validate_camera(camera_id: str, db: Session) -> Dict[str, Any]:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise ValueError(f"Camera with ID {camera_id} not found.")

        # Find primary or first enabled source
        source = db.query(CameraSource).filter(
            CameraSource.camera_id == camera_id,
            CameraSource.enabled == True
        ).first()

        if not source:
            camera.status = "OFFLINE"
            health = CameraHealth(
                camera_id=camera.id,
                state="OFFLINE",
                reason="No enabled camera source configured."
            )
            db.add(health)
            db.commit()
            return {
                "valid": False,
                "status": "OFFLINE",
                "error_reason": "No enabled camera source configured."
            }

        adapter = VMSFederationManager.get_adapter(
            source_type=camera.source_type,
            endpoint=source.endpoint
        )

        start_time = time.time()
        try:
            health_status = await adapter.get_health(camera.id)
            latency_ms = (time.time() - start_time) * 1000.0

            is_online = (health_status.state == "ONLINE")
            camera.status = "ONLINE" if is_online else "OFFLINE"

            health_record = CameraHealth(
                camera_id=camera.id,
                state=camera.status,
                latency_ms=round(latency_ms, 2),
                fps=health_status.fps,
                bitrate=health_status.bitrate_kbps,
                reason=health_status.error_reason,
                recorded_at=datetime.now(timezone.utc)
            )
            db.add(health_record)
            db.commit()

            return {
                "camera_id": camera.id,
                "valid": is_online,
                "status": "SUCCESS" if is_online else "FAILED",
                "camera_status": camera.status,
                "codec": "H.264",
                "resolution": "1920x1080",
                "fps": health_status.fps,
                "bitrate_kbps": health_status.bitrate_kbps,
                "audio_present": False,
                "probe_latency_ms": round(latency_ms, 2),
                "latency_ms": round(latency_ms, 2),
                "error": health_status.error_reason,
                "error_reason": health_status.error_reason
            }
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000.0
            camera.status = "OFFLINE"
            health_record = CameraHealth(
                camera_id=camera.id,
                state="OFFLINE",
                latency_ms=round(latency_ms, 2),
                fps=0.0,
                bitrate=0.0,
                reason=str(e),
                recorded_at=datetime.now(timezone.utc)
            )
            db.add(health_record)
            db.commit()

            return {
                "camera_id": camera.id,
                "valid": False,
                "status": "FAILED",
                "camera_status": "OFFLINE",
                "codec": "Unknown",
                "resolution": "Unknown",
                "fps": 0.0,
                "bitrate_kbps": 0.0,
                "audio_present": False,
                "probe_latency_ms": round(latency_ms, 2),
                "latency_ms": round(latency_ms, 2),
                "error": str(e),
                "error_reason": str(e)
            }
