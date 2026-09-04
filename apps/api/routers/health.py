from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from apps.api.database import get_db
from services.health_monitor.monitor import health_monitor

router = APIRouter(prefix="/api/health", tags=["System Health"])

@router.get("")
async def get_health(db: Session = Depends(get_db)):
    """System health check endpoint for Compose, K8s probes, and monitoring."""
    return await health_monitor.get_system_health(db)
