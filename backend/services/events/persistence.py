import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.services.camera_registry.models import DetectionEvent, VehicleRead, Camera
from backend.services.watchlist.normalizer import normalize_plate
from backend.services.correlation.engine import correlation_engine
from backend.services.alerts.service import alert_service
from backend.services.events.bus import event_bus
from backend.services.events.evidence_generator import generate_all_for_event

logger = logging.getLogger(__name__)

class EventPersistenceService:
    """Validates and idempotently persists edge detection events."""

    @staticmethod
    async def persist_detection_event(payload: Dict[str, Any], db: Session) -> Dict[str, Any]:
        event_id = payload.get("event_id")
        if not event_id:
            raise ValueError("Missing mandatory 'event_id' in detection payload.")

        # Idempotency check: if event_id exists, return already stored record
        existing = db.query(DetectionEvent).filter(DetectionEvent.event_id == event_id).first()
        if existing:
            return {"status": "DUPLICATE_IGNORED", "event_id": event_id}

        camera_id = payload.get("camera_id")
        if not camera_id:
            raise ValueError("Missing mandatory 'camera_id' in detection payload.")

        # Verify camera existence
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise ValueError(f"Referenced camera_id '{camera_id}' does not exist in registry.")

        # Parse occurred_at
        occurred_raw = payload.get("occurred_at")
        if occurred_raw:
            if isinstance(occurred_raw, str):
                occurred_at = datetime.fromisoformat(occurred_raw.replace('Z', '+00:00'))
            elif isinstance(occurred_raw, datetime):
                occurred_at = occurred_raw
            else:
                occurred_at = datetime.now(timezone.utc)
        else:
            occurred_at = datetime.now(timezone.utc)

        location = payload.get("location") or {}
        lat = location.get("lat", camera.latitude)
        lon = location.get("lon", camera.longitude)

        identifier = payload.get("identifier") or {}
        event_type = payload.get("event_type") or "ANPR"
        confidence = float(payload.get("confidence") or identifier.get("confidence") or 0.90)

        evidence_ref = payload.get("evidence") or {}
        pipeline = payload.get("pipeline") or {}

        # Create DetectionEvent
        detection = DetectionEvent(
            event_id=event_id,
            camera_id=camera_id,
            event_type=event_type,
            identifier=identifier,
            occurred_at=occurred_at,
            confidence=confidence,
            latitude=lat,
            longitude=lon,
            evidence_ref=evidence_ref,
            pipeline=pipeline,
            created_at=datetime.now(timezone.utc)
        )
        db.add(detection)

        # If ANPR event, index into vehicle_reads
        raw_plate = identifier.get("raw") or identifier.get("normalized", "")
        norm_plate = identifier.get("normalized") or normalize_plate(raw_plate)

        if raw_plate or norm_plate:
            v_read = VehicleRead(
                event_id=event_id,
                normalized_plate=norm_plate,
                raw_plate=raw_plate or norm_plate,
                ocr_confidence=float(identifier.get("confidence", confidence)),
                read_time=occurred_at
            )
            db.add(v_read)

        db.commit()
        db.refresh(detection)

        # Pre-generate real evidence assets (crops, thumbnail, MP4 clip)
        if event_type == "ANPR" and norm_plate:
            cam_code = camera.camera_code if camera else "CAM-01"
            generate_all_for_event(event_id, norm_plate, cam_code)

        # Route through correlation and watchlist matching for ANPR
        correlation_result = await correlation_engine.process_detection_event(detection, db)

        # If ANOMALY event, directly trigger immediate emergency alert
        if event_type == "ANOMALY":
            anom_type = identifier.get("normalized") or "TRAFFIC_ANOMALY"
            severity = identifier.get("severity") or "HIGH"
            notes = identifier.get("description") or f"Anomaly {anom_type} detected on camera {camera.camera_code}"
            try:
                await alert_service.create_alert(
                    event_id=event_id,
                    entity_id=camera_id,
                    severity=severity,
                    notes=notes,
                    db=db
                )
                logger.info(f"[AnomalyAlertCreated] Event {event_id} -> {anom_type} ({severity}) on {camera.camera_code}")
            except Exception as ex:
                logger.warning(f"Could not create alert for anomaly event {event_id}: {ex}")

        # Publish to downstream event bus
        await event_bus.publish(
            topic="anpr.events" if event_type == "ANPR" else "anomaly.events",
            key=norm_plate or camera_id,
            value=payload
        )

        return {
            "status": "PERSISTED",
            "event_id": event_id,
            "correlated": correlation_result is not None or event_type == "ANOMALY"
        }

event_persistence = EventPersistenceService()
