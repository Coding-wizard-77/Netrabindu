from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.dependencies import get_current_user, require_role, verify_department_scope
from services.camera_registry.models import Camera, CameraSource, User
from services.camera_registry.schemas import (
    CameraCreate, CameraOut, CameraDetailOut, CameraImportResult, ONVIFDiscoverRequest
)
from services.camera_registry.service import camera_registry_service
from services.ingestion.validator import FeedValidator
from services.ingestion.stream_manager import stream_manager
from adapters.onvif import ONVIFAdapter
from services.audit.logger import audit_service

router = APIRouter(prefix="/api/cameras", tags=["Camera Registry & Feeds"])

@router.post("/import", response_model=CameraImportResult)
async def import_cameras_csv(
    file: Optional[UploadFile] = File(None),
    csv_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    if file:
        content = (await file.read()).decode("utf-8", errors="ignore")
    elif csv_text:
        content = csv_text
    else:
        raise HTTPException(status_code=400, detail="Either a CSV file or csv_text form parameter is required.")

    result = camera_registry_service.import_from_csv_content(content, db)
    audit_service.log(
        actor=current_user.username,
        action="CAMERA_CSV_IMPORT",
        db=db,
        result="SUCCESS" if result.imported_count > 0 else "PARTIAL",
        reason=f"Imported {result.imported_count}, Failed {result.failed_count}"
    )
    return result

@router.post("/discover/onvif")
async def discover_onvif(
    req: ONVIFDiscoverRequest,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    """Probes local network for ONVIF Profile S compliant devices."""
    devices = await ONVIFAdapter.discover_devices(timeout=req.timeout_seconds)
    return {"discovered_count": len(devices), "devices": devices}

@router.post("", response_model=CameraOut, status_code=status.HTTP_201_CREATED)
def create_camera(
    data: CameraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    if not verify_department_scope(current_user, data.department_id):
        raise HTTPException(status_code=403, detail="Cannot create camera outside assigned department.")

    try:
        camera = camera_registry_service.create_camera(data, db)
        audit_service.log(
            actor=current_user.username,
            action="CAMERA_CREATE",
            db=db,
            target=camera.id,
            result="SUCCESS"
        )
        return CameraOut.model_validate(camera)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[CameraOut])
def list_cameras(
    department_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce department scope
    user_roles = [r.name.upper() for r in current_user.roles]
    if "SUPER_ADMIN" not in user_roles and current_user.department_id:
        department_id = current_user.department_id

    cameras, total = camera_registry_service.list_cameras(
        db=db,
        department_id=department_id,
        status=status,
        search=search,
        skip=skip,
        limit=limit
    )
    return [CameraOut.model_validate(c) for c in cameras]

@router.get("/{id}", response_model=CameraDetailOut)
def get_camera(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    camera = db.query(Camera).filter(Camera.id == id).first()
    if not camera:
        raise HTTPException(status_code=404, detail=f"Camera with ID {id} not found.")

    if not verify_department_scope(current_user, camera.department_id):
        raise HTTPException(status_code=403, detail="Unauthorized access to this department camera.")

    return CameraDetailOut.model_validate(camera)

@router.post("/{id}/validate")
async def validate_camera(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN", "OPERATOR"]))
):
    try:
        validation_result = await FeedValidator.validate_camera(id, db)
        audit_service.log(
            actor=current_user.username,
            action="CAMERA_SOURCE_VALIDATE",
            db=db,
            target=id,
            result="SUCCESS" if validation_result["valid"] else "FAILURE",
            reason=validation_result.get("error_reason")
        )
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/start")
async def start_camera_ingestion(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    camera = db.query(Camera).filter(Camera.id == id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    source = db.query(CameraSource).filter(CameraSource.camera_id == id, CameraSource.enabled == True).first()
    if not source:
        raise HTTPException(status_code=400, detail="No active source configured for camera.")

    success = await stream_manager.register_stream_path(camera.id, source.endpoint)
    if success:
        camera.status = "ONLINE"
        db.commit()
    return {"status": "INGESTING", "camera_id": camera.id}

@router.post("/{id}/stop")
async def stop_camera_ingestion(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "DEPT_ADMIN"]))
):
    camera = db.query(Camera).filter(Camera.id == id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    await stream_manager.unregister_stream_path(camera.id)
    camera.status = "OFFLINE"
    db.commit()
    return {"status": "STOPPED", "camera_id": camera.id}

@router.get("/{id}/stream")
def get_camera_stream_session(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camera = db.query(Camera).filter(Camera.id == id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    if not verify_department_scope(current_user, camera.department_id):
        raise HTTPException(status_code=403, detail="Unauthorized access to camera stream.")

    audit_service.log(
        actor=current_user.username,
        action="CAMERA_STREAM_SESSION_REQUEST",
        db=db,
        target=id,
        result="SUCCESS"
    )

    return stream_manager.get_stream_urls(camera.id)
