from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from prometheus_client import CONTENT_TYPE_LATEST
from backend.database import get_db
from backend.services.health_monitor.monitor import health_monitor
from backend.services.camera_registry.models import Camera, DetectionEvent, Alert

router = APIRouter(prefix="/api/metrics", tags=["Metrics & Telemetry"])

@router.get("")
def get_metrics_export(format: str = "prometheus", db: Session = Depends(get_db)):
    health_monitor.update_camera_metrics(db)

    if format == "json":
        total_cams = db.query(Camera).count()
        online_cams = db.query(Camera).filter(Camera.status == "ONLINE").count()
        degraded_cams = db.query(Camera).filter(Camera.status == "DEGRADED").count()
        offline_cams = db.query(Camera).filter(Camera.status == "OFFLINE").count()
        total_events = db.query(DetectionEvent).count()
        new_alerts = db.query(Alert).filter(Alert.state == "NEW").count()

        return {
            "cameras": {
                "total": total_cams,
                "online": online_cams,
                "degraded": degraded_cams,
                "offline": offline_cams
            },
            "events_total": total_events,
            "active_new_alerts": new_alerts
        }

    # Default Prometheus exposition format
    metrics_data = health_monitor.get_metrics_prometheus()
    return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)
