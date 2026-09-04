import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.services.camera_registry.models import Alert, DetectionEvent, WatchlistEntity, Camera
from backend.services.alerts.ws_manager import alert_ws_manager
from backend.services.events.bus import event_bus

logger = logging.getLogger(__name__)

VALID_TRANSITIONS = {
    "NEW": ["ACKNOWLEDGED", "DISPATCHED", "RESOLVED", "FALSE_POSITIVE"],
    "ACKNOWLEDGED": ["DISPATCHED", "RESOLVED", "FALSE_POSITIVE"],
    "DISPATCHED": ["RESOLVED", "FALSE_POSITIVE"],
    "RESOLVED": [],
    "FALSE_POSITIVE": []
}

class AlertService:
    """Core alert lifecycle management and event dispatch."""

    @staticmethod
    async def create_alert(
        event_id: str,
        entity_id: str,
        severity: str,
        notes: str,
        db: Session
    ) -> Alert:
        # Check if alert already exists for this event and entity (idempotency)
        existing = db.query(Alert).filter(
            Alert.event_id == event_id,
            Alert.entity_id == entity_id
        ).first()
        if existing:
            return existing

        alert = Alert(
            event_id=event_id,
            entity_id=entity_id,
            severity=severity,
            state="NEW",
            notes=notes,
            created_at=datetime.now(timezone.utc)
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Retrieve camera info for rich notification
        event = db.query(DetectionEvent).filter(DetectionEvent.event_id == event_id).first()
        camera = db.query(Camera).filter(Camera.id == event.camera_id).first() if event else None
        entity = db.query(WatchlistEntity).filter(WatchlistEntity.id == entity_id).first()

        alert_payload = {
            "id": alert.id,
            "event_id": event_id,
            "entity_id": entity_id,
            "entity_identifier": entity.identifier if entity else "Unknown",
            "watchlist_category": entity.category if entity else "General",
            "severity": alert.severity,
            "state": alert.state,
            "notes": alert.notes,
            "camera_id": camera.id if camera else None,
            "camera_name": camera.name if camera else "Unknown Camera",
            "latitude": camera.latitude if camera else (event.latitude if event else None),
            "longitude": camera.longitude if camera else (event.longitude if event else None),
            "occurred_at": event.occurred_at.isoformat() if event else None,
            "created_at": alert.created_at.isoformat(),
            "evidence": event.evidence_ref if event else {}
        }

        # 1. Broadcast to real-time WebSocket clients
        await alert_ws_manager.broadcast_alert(alert_payload)

        # 2. Publish to events bus topic
        await event_bus.publish(
            topic="alerts",
            key=alert.id,
            value=alert_payload
        )

        return alert

    @staticmethod
    async def transition_state(
        alert_id: str,
        new_state: str,
        actor: str,
        db: Session,
        notes: Optional[str] = None,
        dispatch_unit: Optional[str] = None
    ) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError(f"Alert with ID {alert_id} not found.")

        allowed = VALID_TRANSITIONS.get(alert.state, [])
        if new_state not in allowed:
            raise ValueError(f"Illegal state transition from {alert.state} to {new_state}.")

        alert.state = new_state
        now = datetime.now(timezone.utc)

        if new_state == "ACKNOWLEDGED":
            alert.acknowledged_by = actor
            alert.acknowledged_at = now
            if notes:
                alert.notes = f"{alert.notes or ''}\n[Ack notes]: {notes}".strip()
        elif new_state == "DISPATCHED":
            alert.dispatch_unit = dispatch_unit or "District Patrol"
            if notes:
                alert.notes = f"{alert.notes or ''}\n[Dispatch]: {notes}".strip()
        elif new_state in ("RESOLVED", "FALSE_POSITIVE"):
            alert.resolved_by = actor
            alert.resolved_at = now
            if notes:
                alert.notes = f"{alert.notes or ''}\n[{new_state}]: {notes}".strip()

        db.commit()
        db.refresh(alert)

        # Broadcast state update
        await alert_ws_manager.broadcast_alert_update(alert.id, alert.state, actor)

        return alert

alert_service = AlertService()
