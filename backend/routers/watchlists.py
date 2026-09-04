from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies import get_current_user, require_role, verify_department_scope
from backend.services.camera_registry.models import WatchlistEntity, WatchlistAlias, User
from backend.services.watchlist.normalizer import normalize_plate
from backend.services.watchlist.matcher import watchlist_matcher
from backend.services.audit.logger import audit_service

router = APIRouter(prefix="/api/watchlists", tags=["Watchlists"])

class WatchlistEntityCreate(BaseModel):
    entity_type: str = "VEHICLE"  # VEHICLE, PERSON
    identifier: str
    category: str = "WANTED"      # STOLEN, WANTED, SUSPECT, BOLO
    priority: str = "HIGH"        # CRITICAL, HIGH, MEDIUM, LOW
    source_ref: Optional[str] = None
    notes: Optional[str] = None
    department_id: Optional[str] = None
    aliases: List[str] = []

class WatchlistEntityOut(BaseModel):
    id: str
    entity_type: str
    identifier: str
    normalized_identifier: str
    category: str
    priority: str
    source_ref: Optional[str]
    notes: Optional[str]
    status: str
    department_id: Optional[str]
    created_at: datetime
    aliases: List[str] = []

    class Config:
        from_attributes = True

class MatchDiagnosticRequest(BaseModel):
    identifier: str
    confidence: float = 0.90

@router.get("", response_model=List[WatchlistEntityOut])
def list_watchlists(
    entity_type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = "ACTIVE",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WatchlistEntity)

    user_roles = [r.name.upper() for r in current_user.roles]
    if "SUPER_ADMIN" not in user_roles and current_user.department_id:
        query = query.filter(
            (WatchlistEntity.department_id == current_user.department_id) |
            (WatchlistEntity.department_id == None)
        )

    if entity_type:
        query = query.filter(WatchlistEntity.entity_type == entity_type.upper())
    if category:
        query = query.filter(WatchlistEntity.category == category.upper())
    if status:
        query = query.filter(WatchlistEntity.status == status.upper())

    entities = query.order_by(WatchlistEntity.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for e in entities:
        alias_list = [a.alias for a in e.aliases]
        out = WatchlistEntityOut(
            id=e.id,
            entity_type=e.entity_type,
            identifier=e.identifier,
            normalized_identifier=e.normalized_identifier,
            category=e.category,
            priority=e.priority,
            source_ref=e.source_ref,
            notes=e.notes,
            status=e.status,
            department_id=e.department_id,
            created_at=e.created_at,
            aliases=alias_list
        )
        result.append(out)
    return result

@router.post("", response_model=WatchlistEntityOut, status_code=status.HTTP_201_CREATED)
def create_watchlist_entity(
    data: WatchlistEntityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN", "INVESTIGATOR"]))
):
    norm = normalize_plate(data.identifier)
    dept_id = data.department_id or current_user.department_id

    entity = WatchlistEntity(
        entity_type=data.entity_type.upper(),
        identifier=data.identifier.strip(),
        normalized_identifier=norm,
        category=data.category.upper(),
        priority=data.priority.upper(),
        source_ref=data.source_ref,
        notes=data.notes,
        department_id=dept_id,
        status="ACTIVE"
    )
    db.add(entity)
    db.flush()

    # Add aliases
    for alias_raw in data.aliases:
        alias_clean = normalize_plate(alias_raw)
        if alias_clean and alias_clean != norm:
            alias_rec = WatchlistAlias(
                entity_id=entity.id,
                alias=alias_clean,
                normalization_type="PLATE_NORMALIZED"
            )
            db.add(alias_rec)

    db.commit()
    db.refresh(entity)

    audit_service.log(
        actor=current_user.username,
        action="WATCHLIST_CREATE",
        target=entity.id,
        db=db,
        result="SUCCESS"
    )

    return WatchlistEntityOut(
        id=entity.id,
        entity_type=entity.entity_type,
        identifier=entity.identifier,
        normalized_identifier=entity.normalized_identifier,
        category=entity.category,
        priority=entity.priority,
        source_ref=entity.source_ref,
        notes=entity.notes,
        status=entity.status,
        department_id=entity.department_id,
        created_at=entity.created_at,
        aliases=[a.alias for a in entity.aliases]
    )

@router.post("/match")
def diagnostic_match(
    req: MatchDiagnosticRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Diagnostic candidate matching for operators and investigators."""
    res = watchlist_matcher.match_plate(
        raw_plate=req.identifier,
        ocr_confidence=req.confidence,
        db=db,
        department_id=current_user.department_id
    )
    return {
        "query_identifier": req.identifier,
        "matched": res.matched,
        "similarity_score": res.similarity_score,
        "match_type": res.match_type,
        "requires_review": res.requires_review,
        "entity": {
            "id": res.entity.id,
            "identifier": res.entity.identifier,
            "category": res.entity.category,
            "priority": res.entity.priority
        } if res.entity else None,
        "details": res.details
    }
