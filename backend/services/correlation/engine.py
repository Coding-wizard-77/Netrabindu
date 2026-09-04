import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.services.camera_registry.models import DetectionEvent
from backend.services.watchlist.matcher import watchlist_matcher
from backend.services.alerts.service import alert_service
from backend.services.events.bus import event_bus

logger = logging.getLogger(__name__)

class CorrelationEngine:
    """Correlates detection events against watchlists, active investigations, and rules."""

    @staticmethod
    async def process_detection_event(event: DetectionEvent, db: Session) -> Optional[Dict[str, Any]]:
        # Check if ANPR event
        if event.event_type != "ANPR" or not event.identifier:
            return None

        identifier_data = event.identifier if isinstance(event.identifier, dict) else {}
        raw_plate = identifier_data.get("raw") or identifier_data.get("normalized", "")
        ocr_confidence = float(identifier_data.get("confidence", event.confidence or 0.8))

        if not raw_plate:
            return None

        match_res = watchlist_matcher.match_plate(
            raw_plate=raw_plate,
            ocr_confidence=ocr_confidence,
            db=db
        )

        if match_res.matched and match_res.entity:
            entity = match_res.entity
            logger.info(f"Watchlist MATCH! Event: {event.event_id}, Entity: {entity.identifier}, Score: {match_res.similarity_score}")

            # Publish to watchlist.matches topic
            match_event_data = {
                "event_id": event.event_id,
                "entity_id": entity.id,
                "matched_identifier": entity.identifier,
                "watchlist_category": entity.category,
                "priority": entity.priority,
                "match_type": match_res.match_type,
                "similarity_score": match_res.similarity_score,
                "requires_review": match_res.requires_review
            }
            await event_bus.publish(
                topic="watchlist.matches",
                key=entity.id,
                value=match_event_data
            )

            # Determine severity
            severity = entity.priority
            if match_res.requires_review and severity == "CRITICAL":
                severity = "HIGH"

            alert = await alert_service.create_alert(
                event_id=event.event_id,
                entity_id=entity.id,
                severity=severity,
                notes=f"{match_res.details} [OCR Conf: {ocr_confidence:.2f}]",
                db=db
            )

            return {
                "matched": True,
                "match_res": match_res,
                "alert_id": alert.id
            }

        return None

correlation_engine = CorrelationEngine()
