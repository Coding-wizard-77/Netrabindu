from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies import require_role
from backend.services.camera_registry.models import AuditLog, User

router = APIRouter(prefix="/api/audit", tags=["Security & Audit"])

class AuditLogOut(BaseModel):
    id: str
    actor: str
    action: str
    target: Optional[str]
    department_context: Optional[str]
    request_id: Optional[str]
    source_ip: Optional[str]
    result: str
    reason: Optional[str]
    timestamp_utc: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    actor: Optional[str] = None,
    action: Optional[str] = None,
    from_time: Optional[datetime] = Query(None, alias="from"),
    to_time: Optional[datetime] = Query(None, alias="to"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    query = db.query(AuditLog)
    if actor:
        query = query.filter(AuditLog.actor.ilike(f"%{actor}%"))
    if action:
        query = query.filter(AuditLog.action == action.upper())
    if from_time:
        query = query.filter(AuditLog.timestamp_utc >= from_time)
    if to_time:
        query = query.filter(AuditLog.timestamp_utc <= to_time)

    logs = query.order_by(AuditLog.timestamp_utc.desc()).offset(skip).limit(limit).all()
    return [AuditLogOut.model_validate(l) for l in logs]
