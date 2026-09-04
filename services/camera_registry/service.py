import csv
import io
import logging
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from services.camera_registry.models import (
    Camera, CameraSource, CameraAdaptiveProfile, CameraCapability, Department
)
from services.camera_registry.schemas import CameraCreate, CameraImportResult, CameraOut

logger = logging.getLogger(__name__)

class CameraRegistryService:
    """Core camera registry operations, onboarding, and inventory importing."""

    @staticmethod
    def create_camera(data: CameraCreate, db: Session) -> Camera:
        # Check uniqueness of camera_code
        existing = db.query(Camera).filter(Camera.camera_code == data.camera_code).first()
        if existing:
            raise ValueError(f"Camera with code '{data.camera_code}' already exists.")

        # Ensure department exists
        dept = db.query(Department).filter(Department.id == data.department_id).first()
        if not dept:
            # Fallback check if department_id was passed as department code
            dept = db.query(Department).filter(Department.code == data.department_id).first()
            if not dept:
                raise ValueError(f"Department '{data.department_id}' not found.")
            data.department_id = dept.id

        camera = Camera(
            camera_code=data.camera_code,
            name=data.name,
            department_id=data.department_id,
            latitude=data.latitude,
            longitude=data.longitude,
            address=data.address,
            vendor=data.vendor,
            model=data.model,
            source_type=data.source_type,
            protocol=data.protocol,
            status="UNKNOWN",
            retention_days=data.retention_days,
            analytics_profile=data.analytics_profile
        )
        db.add(camera)
        db.flush()

        # Add Source
        source = CameraSource(
            camera_id=camera.id,
            source_kind="MAIN_STREAM",
            endpoint=data.endpoint,
            secret_ref=f"secret_{camera.id}" if data.password else None,
            enabled=True
        )
        db.add(source)

        # Add Adaptive Profile
        prof_data = data.adaptive_profile
        adaptive_profile = CameraAdaptiveProfile(
            camera_id=camera.id,
            quality_states=prof_data.quality_states if prof_data else {
                "idle": {"fps": 2, "resolution": "480p", "bitrate_kbps": 256},
                "normal": {"fps": 10, "resolution": "720p", "bitrate_kbps": 1024},
                "active": {"fps": 20, "resolution": "1080p", "bitrate_kbps": 2048},
                "critical": {"fps": 25, "resolution": "1080p", "bitrate_kbps": 4096}
            },
            activity_thresholds=prof_data.activity_thresholds if prof_data else {"motion_trigger": 0.35},
            cooldowns=prof_data.cooldowns if prof_data else {"state_cooldown_seconds": 30},
            stream_profiles={},
            inference_tiers={"idle": "SENTINEL", "normal": "DETECTOR", "active": "CASCADED_TASK", "critical": "FULL"},
            pre_event_buffer_seconds=prof_data.pre_event_buffer_seconds if prof_data else 10
        )
        db.add(adaptive_profile)

        # Add default capabilities
        cap = CameraCapability(
            camera_id=camera.id,
            capability_json={
                "ptz": False,
                "anpr": True,
                "audio": False,
                "webrtc": True,
                "multi_stream": False
            }
        )
        db.add(cap)

        db.commit()
        db.refresh(camera)
        return camera

    @staticmethod
    def list_cameras(
        db: Session,
        department_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Camera], int]:
        query = db.query(Camera)
        if department_id:
            query = query.filter(Camera.department_id == department_id)
        if status:
            query = query.filter(Camera.status == status.upper())
        if search:
            s = f"%{search}%"
            query = query.filter(
                or_(
                    Camera.camera_code.ilike(s),
                    Camera.name.ilike(s),
                    Camera.address.ilike(s)
                )
            )

        total = query.count()
        cameras = query.offset(skip).limit(limit).all()
        return cameras, total

    @staticmethod
    def import_from_csv_content(csv_content: str, db: Session) -> CameraImportResult:
        """
        Parses CSV inventory conforming to master specification:
        camera_code,name,department_code,latitude,longitude,vendor,model,source_type,protocol,endpoint,username,retention_days,analytics_profile
        """
        reader = csv.DictReader(io.StringIO(csv_content))
        imported_cameras = []
        errors = []

        for row_num, row in enumerate(reader, start=1):
            try:
                code = row.get("camera_code", "").strip()
                name = row.get("name", "").strip()
                dept_code = row.get("department_code", "").strip()
                lat_str = row.get("latitude", "").strip()
                lon_str = row.get("longitude", "").strip()
                endpoint = row.get("endpoint", "").strip()

                if not code or not name or not dept_code or not lat_str or not lon_str or not endpoint:
                    errors.append({
                        "row": row_num,
                        "code": code,
                        "error": "Missing required CSV columns (camera_code, name, department_code, latitude, longitude, endpoint)."
                    })
                    continue

                # Lookup or create department
                dept = db.query(Department).filter(Department.code == dept_code).first()
                if not dept:
                    dept = Department(
                        code=dept_code,
                        name=f"Department {dept_code}",
                        status="ACTIVE"
                    )
                    db.add(dept)
                    db.flush()

                # Check if camera already exists
                existing = db.query(Camera).filter(Camera.camera_code == code).first()
                if existing:
                    errors.append({"row": row_num, "code": code, "error": f"Camera code '{code}' already exists."})
                    continue

                create_data = CameraCreate(
                    camera_code=code,
                    name=name,
                    department_id=dept.id,
                    latitude=float(lat_str),
                    longitude=float(lon_str),
                    vendor=row.get("vendor", "Generic").strip() or "Generic",
                    model=row.get("model", "Standard").strip() or "Standard",
                    source_type=row.get("source_type", "DIRECT_RTSP").strip() or "DIRECT_RTSP",
                    protocol=row.get("protocol", "RTSP").strip() or "RTSP",
                    endpoint=endpoint,
                    username=row.get("username", "").strip() or None,
                    password=row.get("password", "").strip() or None,
                    retention_days=int(row.get("retention_days", 15) or 15),
                    analytics_profile=row.get("analytics_profile", "ANPR").strip() or "ANPR"
                )

                cam = CameraRegistryService.create_camera(create_data, db)
                imported_cameras.append(CameraOut.model_validate(cam))
            except Exception as e:
                errors.append({"row": row_num, "code": row.get("camera_code"), "error": str(e)})

        return CameraImportResult(
            imported_count=len(imported_cameras),
            failed_count=len(errors),
            cameras=imported_cameras,
            errors=errors
        )

camera_registry_service = CameraRegistryService()
