import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from apps.api.database import get_db
from apps.api.main import app
from apps.api.dependencies import hash_password, create_access_token
from services.camera_registry.models import Base, User, Role, Department, Camera, WatchlistEntity

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    SessionTest = sessionmaker(bind=connection)
    session = SessionTest()

    # Seed base test data
    admin_role = Role(name="SUPER_ADMIN", description="Super Administrator")
    operator_role = Role(name="OPERATOR", description="Control Room Operator")
    session.add_all([admin_role, operator_role])

    dept = Department(code="DEPT-TEST", name="Test Headquarters", status="ACTIVE")
    session.add(dept)
    session.flush()

    admin_user = User(
        username="admin_test",
        password_hash=hash_password("AdminPass123!"),
        email="admin_test@police.gov.in",
        department_id=dept.id,
        status="ACTIVE"
    )
    admin_user.roles.append(admin_role)
    session.add(admin_user)
    session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def admin_token(db_session):
    admin = db_session.query(User).filter(User.username == "admin_test").first()
    return create_access_token({"sub": admin.id, "username": admin.username, "roles": ["SUPER_ADMIN"]})
