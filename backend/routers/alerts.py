from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, computed_field
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies import get_current_user, require_role
from backend.services.camera_registry.models import Alert, DetectionEvent, WatchlistEntity, Camera, User
from backend.services.alerts.service import alert_service
from backend.services.audit.logger import audit_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Real-time Operations"])

class AlertActionRequest(BaseModel):
    notes: Optional[str] = None
    dispatch_unit: Optional[str] = None
    resolution: Optional[str] = None  # RESOLVED or FALSE_POSITIVE

class AlertOut(BaseModel):
    id: str
    event_id: str
    entity_id: str
    severity: str
    state: str
    notes: Optional[str] = None
    dispatch_unit: Optional[str] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    entity_identifier: Optional[str] = None
    target_identifier: Optional[str] = None
    detected_identifier: Optional[str] = None
    watchlist_category: Optional[str] = "GENERAL"
    confidence: Optional[float] = 0.95
    camera_id: Optional[str] = None
    camera_name: Optional[str] = None
    camera_code: Optional[str] = None
    department_name: Optional[str] = None
    occurred_at: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence: Optional[dict] = None

    @computed_field
    @property
    def location(self) -> Dict[str, float]:
        lat = self.latitude if self.latitude is not None else 0.0
        lon = self.longitude if self.longitude is not None else 0.0
        return {"lat": lat, "lon": lon}

    class Config:
        from_attributes = True

@router.get("", response_model=List[AlertOut])
def list_alerts(
    state: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if state:
        query = query.filter(Alert.state == state.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())

    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for a in alerts:
        event = a.detection_event
        entity = a.watchlist_entity
        cam = event.camera if event else None
        dept = cam.department if cam else None

        raw_id = event.identifier.get("raw") if (event and isinstance(event.identifier, dict)) else None
        target_id = entity.identifier if entity else raw_id
        detected_id = raw_id if raw_id else target_id

        results.append(AlertOut(
            id=a.id,
            event_id=a.event_id,
            entity_id=a.entity_id,
            severity=a.severity,
            state=a.state,
            notes=a.notes,
            dispatch_unit=a.dispatch_unit,
            acknowledged_by=a.acknowledged_by,
            resolved_by=a.resolved_by,
            created_at=a.created_at,
            acknowledged_at=a.acknowledged_at,
            resolved_at=a.resolved_at,
            entity_identifier=target_id,
            target_identifier=target_id,
            detected_identifier=detected_id,
            watchlist_category=entity.category if entity else "GENERAL",
            confidence=event.confidence if event else 0.95,
            camera_id=cam.id if cam else (event.camera_id if event else None),
            camera_name=cam.name if cam else None,
            camera_code=cam.camera_code if cam else None,
            department_name=dept.name if dept else None,
            occurred_at=event.occurred_at if event else a.created_at,
            latitude=cam.latitude if cam else (event.latitude if event else None),
            longitude=cam.longitude if cam else (event.longitude if event else None),
            evidence=event.evidence_ref if event else {}
        ))
    return results

@router.post("/{id}/acknowledge", response_model=AlertOut)
async def acknowledge_alert(
    id: str,
    req: AlertActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN", "OPERATOR"]))
):
    try:
        updated = await alert_service.transition_state(
            alert_id=id,
            new_state="ACKNOWLEDGED",
            actor=current_user.username,
            db=db,
            notes=req.notes
        )
        audit_service.log(
            actor=current_user.username,
            action="ALERT_ACKNOWLEDGE",
            target=id,
            db=db,
            result="SUCCESS"
        )
        return AlertOut.model_validate(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/dispatch", response_model=AlertOut)
async def dispatch_alert(
    id: str,
    req: AlertActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN", "OPERATOR"]))
):
    try:
        updated = await alert_service.transition_state(
            alert_id=id,
            new_state="DISPATCHED",
            actor=current_user.username,
            db=db,
            notes=req.notes,
            dispatch_unit=req.dispatch_unit
        )
        audit_service.log(
            actor=current_user.username,
            action="ALERT_DISPATCH",
            target=id,
            db=db,
            result="SUCCESS",
            reason=f"Unit: {req.dispatch_unit}"
        )
        return AlertOut.model_validate(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/resolve", response_model=AlertOut)
async def resolve_alert(
    id: str,
    req: AlertActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN", "OPERATOR"]))
):
    resolution = req.resolution.upper() if req.resolution else "RESOLVED"
    if resolution not in ("RESOLVED", "FALSE_POSITIVE"):
        resolution = "RESOLVED"

    try:
        updated = await alert_service.transition_state(
            alert_id=id,
            new_state=resolution,
            actor=current_user.username,
            db=db,
            notes=req.notes
        )
        audit_service.log(
            actor=current_user.username,
            action=f"ALERT_{resolution}",
            target=id,
            db=db,
            result="SUCCESS"
        )
        return AlertOut.model_validate(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
