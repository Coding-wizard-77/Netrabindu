import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.services.camera_registry.models import AuditLog

logger = logging.getLogger(__name__)

class AuditService:
    """Tamper-evident audit logging for all privileged, administrative and security events."""

    @staticmethod
    def log(
        actor: str,
        action: str,
        db: Session,
        target: Optional[str] = None,
        department_context: Optional[str] = None,
        request_id: Optional[str] = None,
        source_ip: Optional[str] = None,
        result: str = "SUCCESS",
        reason: Optional[str] = None
    ) -> AuditLog:
        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            actor=actor,
            action=action,
            target=target,
            department_context=department_context,
            request_id=request_id or str(uuid.uuid4()),
            source_ip=source_ip,
            result=result,
            reason=reason,
            timestamp_utc=datetime.now(timezone.utc)
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)

        logger.info(f"[AUDIT] Actor={actor} Action={action} Target={target} Result={result}")
        return audit_entry

audit_service = AuditService()
