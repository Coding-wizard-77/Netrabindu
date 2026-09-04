from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies import get_current_user
from backend.services.camera_registry.models import User
from backend.services.route_engine.reconstructor import route_engine
from backend.services.audit.logger import audit_service

router = APIRouter(prefix="/api/vehicles", tags=["Vehicle Investigation & GIS Routes"])

@router.get("/{plate}/timeline")
def get_vehicle_timeline(
    plate: str,
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audit_service.log(
        actor=current_user.username,
        action="VEHICLE_TIMELINE_SEARCH",
        target=plate,
        db=db,
        result="SUCCESS"
    )
    return route_engine.get_timeline(plate=plate, from_time=from_time, to_time=to_time, db=db)

@router.get("/{plate}/route")
def get_vehicle_route(
    plate: str,
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    window_seconds: Optional[int] = Query(30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audit_service.log(
        actor=current_user.username,
        action="VEHICLE_ROUTE_QUERY",
        target=plate,
        db=db,
        result="SUCCESS"
    )
    return route_engine.reconstruct_route(
        plate=plate,
        from_time=from_time,
        to_time=to_time,
        burst_window_seconds=window_seconds,
        db=db
    )

@router.get("/{plate}/evidence")
def get_vehicle_evidence(
    plate: str,
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audit_service.log(
        actor=current_user.username,
        action="VEHICLE_EVIDENCE_ACCESS",
        target=plate,
        db=db,
        result="SUCCESS"
    )
    return route_engine.get_evidence(plate=plate, from_time=from_time, to_time=to_time, db=db)
