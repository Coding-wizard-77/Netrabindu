from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.dependencies import get_current_user
from services.camera_registry.models import Department, User

router = APIRouter(prefix="/api/departments", tags=["Departments"])

class DepartmentOut(BaseModel):
    id: str
    code: str
    name: str
    jurisdiction: str | None
    status: str
    total_cameras: int = 0

    class Config:
        from_attributes = True

@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_roles = [r.name.upper() for r in current_user.roles]
    query = db.query(Department)

    # Scoped: If not super admin, restrict to user's assigned department
    if "SUPER_ADMIN" not in user_roles and current_user.department_id:
        query = query.filter(Department.id == current_user.department_id)

    departments = query.all()
    results = []
    for d in departments:
        results.append(DepartmentOut(
            id=d.id,
            code=d.code,
            name=d.name,
            jurisdiction=d.jurisdiction,
            status=d.status,
            total_cameras=len(d.cameras)
        ))
    return results
