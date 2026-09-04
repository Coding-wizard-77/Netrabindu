import os
import sys

# Ensure repository root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from backend.config import settings
    from backend.database import get_db_context, init_db
    from backend.dependencies import hash_password
    from backend.services.camera_registry.models import User, Role, Department
except ImportError:
    from config import settings
    from database import get_db_context, init_db
    from dependencies import hash_password
    from services.camera_registry.models import User, Role, Department

def provision_admin(
    username: str = settings.ADMIN_USERNAME,
    password: str = settings.ADMIN_PASSWORD,
    email: str = settings.ADMIN_EMAIL,
    dept_code: str = settings.ADMIN_DEPARTMENT
):
    print(f"[*] Initializing database tables...")
    init_db()

    with get_db_context() as db:
        # 1. Seed Roles
        roles = {
            "SUPER_ADMIN": "State-wide Super Administrator with complete system access",
            "DEPT_ADMIN": "Departmental Administrator managing departmental cameras and users",
            "OPERATOR": "Control room operator handling live feeds, alerts, and dispatches",
            "INVESTIGATOR": "Investigator with access to historical vehicle searches and evidence"
        }
        role_objs = {}
        for role_name, desc in roles.items():
            r = db.query(Role).filter(Role.name == role_name).first()
            if not r:
                r = Role(name=role_name, description=desc)
                db.add(r)
                db.flush()
                print(f"[+] Created role: {role_name}")
            role_objs[role_name] = r

        # 2. Seed Default Department
        dept = db.query(Department).filter(Department.code == dept_code).first()
        if not dept:
            dept = Department(
                code=dept_code,
                name="Gujarat Police Headquarters",
                jurisdiction="Gujarat State",
                status="ACTIVE"
            )
            db.add(dept)
            db.flush()
            print(f"[+] Created default department: {dept_code}")

        # 3. Create Super Admin
        admin = db.query(User).filter(User.username == username).first()
        if not admin:
            admin = User(
                username=username,
                password_hash=hash_password(password),
                email=email,
                department_id=dept.id,
                status="ACTIVE"
            )
            admin.roles.append(role_objs["SUPER_ADMIN"])
            db.add(admin)
            print(f"[+] Successfully provisioned Super Administrator '{username}'")
        else:
            print(f"[*] Super Administrator '{username}' already exists.")

if __name__ == "__main__":
    provision_admin()
