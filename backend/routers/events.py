from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies import get_current_user, require_role, verify_department_scope
from backend.services.camera_registry.models import DetectionEvent, Camera, User
from backend.services.events.persistence import event_persistence

router = APIRouter(prefix="/api/events", tags=["Detection Events"])

class DetectionEventIn(BaseModel):
    event_id: str
    event_type: str = "ANPR"
    camera_id: str
    occurred_at: Optional[str] = None
    identifier: Dict[str, Any]
    location: Optional[Dict[str, float]] = None
    evidence: Optional[Dict[str, Any]] = None
    pipeline: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None

class DetectionEventOut(BaseModel):
    event_id: str
    event_type: str
    camera_id: str
    occurred_at: datetime
    confidence: float
    latitude: float
    longitude: float
    identifier: Dict[str, Any]
    evidence_ref: Dict[str, Any]
    pipeline: Dict[str, Any]

    class Config:
        from_attributes = True

@router.get("", response_model=List[DetectionEventOut])
def search_events(
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DetectionEvent)

    # Scoped: If not super admin, check camera belongs to user's dept
    user_roles = [r.name.upper() for r in current_user.roles]
    if "SUPER_ADMIN" not in user_roles and current_user.department_id:
        query = query.join(Camera).filter(Camera.department_id == current_user.department_id)

    if camera_id:
        query = query.filter(DetectionEvent.camera_id == camera_id)
    if event_type:
        query = query.filter(DetectionEvent.event_type == event_type.upper())
    if from_time:
        query = query.filter(DetectionEvent.occurred_at >= from_time)
    if to_time:
        query = query.filter(DetectionEvent.occurred_at <= to_time)

    events = query.order_by(DetectionEvent.occurred_at.desc()).offset(skip).limit(limit).all()
    return [DetectionEventOut.model_validate(e) for e in events]

@router.post("", status_code=status.HTTP_201_CREATED)
async def ingest_event(
    event_in: DetectionEventIn,
    db: Session = Depends(get_db)
):
    """Ingestion endpoint for edge analytics workers."""
    try:
        res = await event_persistence.persist_detection_event(event_in.model_dump(), db)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
