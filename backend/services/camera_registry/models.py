import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, 
    Text, JSON, Table, Index, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# Association table for User <-> Role (Many-to-Many)
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', String(36), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

class Department(Base):
    __tablename__ = 'departments'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    jurisdiction = Column(String(200), nullable=True)
    status = Column(String(20), default='ACTIVE', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    users = relationship('User', back_populates='department')
    cameras = relationship('Camera', back_populates='department')

class Role(Base):
    __tablename__ = 'roles'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    users = relationship('User', secondary=user_roles, back_populates='roles')

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    department_id = Column(String(36), ForeignKey('departments.id'), nullable=True)
    status = Column(String(20), default='ACTIVE', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    department = relationship('Department', back_populates='users')
    roles = relationship('Role', secondary=user_roles, back_populates='users')

class Camera(Base):
    __tablename__ = 'cameras'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    department_id = Column(String(36), ForeignKey('departments.id'), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    vendor = Column(String(100), default='Generic', nullable=False)
    model = Column(String(100), default='Standard', nullable=False)
    source_type = Column(String(50), default='DIRECT_RTSP', nullable=False) # DIRECT_RTSP, ONVIF, VMS
    protocol = Column(String(50), default='RTSP', nullable=False)
    status = Column(String(30), default='UNKNOWN', nullable=False, index=True) # ONLINE, OFFLINE, DEGRADED, UNKNOWN, TESTING
    retention_days = Column(Integer, default=15, nullable=False)
    analytics_profile = Column(String(50), default='ANPR', nullable=False) # ANPR, VEHICLE, PERSON, NONE, CUSTOM
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    department = relationship('Department', back_populates='cameras')
    sources = relationship('CameraSource', back_populates='camera', cascade='all, delete-orphan')
    adaptive_profile = relationship('CameraAdaptiveProfile', back_populates='camera', uselist=False, cascade='all, delete-orphan')
    capabilities = relationship('CameraCapability', back_populates='camera', uselist=False, cascade='all, delete-orphan')
    health_records = relationship('CameraHealth', back_populates='camera', cascade='all, delete-orphan')
    detection_events = relationship('DetectionEvent', back_populates='camera')

    @property
    def department_name(self) -> Optional[str]:
        return self.department.name if self.department else None

    @property
    def department_code(self) -> Optional[str]:
        return self.department.code if self.department else None

    __table_args__ = (
        Index('idx_camera_dept_status', 'department_id', 'status'),
        Index('idx_camera_lat_lon', 'latitude', 'longitude'),
    )

class CameraSource(Base):
    __tablename__ = 'camera_sources'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    source_kind = Column(String(50), default='MAIN_STREAM', nullable=False) # MAIN_STREAM, SUB_STREAM, SENTINEL
    endpoint = Column(String(1000), nullable=False)
    secret_ref = Column(String(255), nullable=True)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    camera = relationship('Camera', back_populates='sources')

class CameraAdaptiveProfile(Base):
    __tablename__ = 'camera_adaptive_profiles'

    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), primary_key=True)
    quality_states = Column(JSON, default=dict, nullable=False) # e.g. {"idle": {"fps": 2, "res": "480p"}}
    activity_thresholds = Column(JSON, default=dict, nullable=False)
    cooldowns = Column(JSON, default=dict, nullable=False)
    stream_profiles = Column(JSON, default=dict, nullable=False)
    inference_tiers = Column(JSON, default=dict, nullable=False)
    pre_event_buffer_seconds = Column(Integer, default=10, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    camera = relationship('Camera', back_populates='adaptive_profile')

class CameraCapability(Base):
    __tablename__ = 'camera_capabilities'

    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), primary_key=True)
    capability_json = Column(JSON, default=dict, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    camera = relationship('Camera', back_populates='capabilities')

class VMSSystem(Base):
    __tablename__ = 'vms_systems'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor = Column(String(100), nullable=False) # Hikvision, Milestone, Dahua, Generic
    name = Column(String(200), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, default=80, nullable=False)
    api_base = Column(String(500), nullable=False)
    auth_ref = Column(String(255), nullable=True)
    department_id = Column(String(36), ForeignKey('departments.id'), nullable=True)
    status = Column(String(30), default='ONLINE', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    bindings = relationship('VMSCameraBinding', back_populates='vms', cascade='all, delete-orphan')

class VMSCameraBinding(Base):
    __tablename__ = 'vms_camera_bindings'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vms_id = Column(String(36), ForeignKey('vms_systems.id', ondelete='CASCADE'), nullable=False)
    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    external_id = Column(String(255), nullable=False)
    external_metadata = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    vms = relationship('VMSSystem', back_populates='bindings')
    camera = relationship('Camera')

    __table_args__ = (
        UniqueConstraint('vms_id', 'external_id', name='uq_vms_external_cam'),
    )

class DetectionEvent(Base):
    __tablename__ = 'detection_events'

    event_id = Column(String(100), primary_key=True) # Deterministic or UUID
    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    event_type = Column(String(50), default='ANPR', nullable=False, index=True) # ANPR, VEHICLE, PERSON
    identifier = Column(JSON, nullable=False) # {"type": "vehicle_plate", "raw": "...", "normalized": "...", "confidence": 0.94}
    occurred_at = Column(DateTime(timezone=True), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    evidence_ref = Column(JSON, default=dict, nullable=False) # {"thumbnail_uri": "...", "clip_uri": "..."}
    pipeline = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    camera = relationship('Camera', back_populates='detection_events')
    vehicle_read = relationship('VehicleRead', back_populates='detection_event', uselist=False, cascade='all, delete-orphan')
    alerts = relationship('Alert', back_populates='detection_event')

    @property
    def camera_name(self) -> Optional[str]:
        return self.camera.name if self.camera else None

    @property
    def camera_code(self) -> Optional[str]:
        return self.camera.camera_code if self.camera else None

    @property
    def department_name(self) -> Optional[str]:
        if self.camera and self.camera.department:
            return self.camera.department.name
        return None

    __table_args__ = (
        Index('idx_event_camera_time', 'camera_id', 'occurred_at'),
        Index('idx_event_type_time', 'event_type', 'occurred_at'),
    )

class VehicleRead(Base):
    __tablename__ = 'vehicle_reads'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(100), ForeignKey('detection_events.event_id', ondelete='CASCADE'), nullable=False, unique=True)
    normalized_plate = Column(String(50), nullable=False, index=True)
    raw_plate = Column(String(50), nullable=False)
    ocr_confidence = Column(Float, nullable=False)
    read_time = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    detection_event = relationship('DetectionEvent', back_populates='vehicle_read')

    __table_args__ = (
        Index('idx_reads_plate_time', 'normalized_plate', 'read_time'),
    )

class WatchlistEntity(Base):
    __tablename__ = 'watchlist_entities'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), default='VEHICLE', nullable=False) # VEHICLE, PERSON
    identifier = Column(String(100), nullable=False)
    normalized_identifier = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default='WANTED', nullable=False, index=True) # STOLEN, WANTED, SUSPECT, BOLO
    priority = Column(String(20), default='HIGH', nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    source_ref = Column(String(255), nullable=True) # e.g. "FIR-1024/2026", "eGujCop-Ref"
    notes = Column(Text, nullable=True)
    status = Column(String(20), default='ACTIVE', nullable=False, index=True)
    department_id = Column(String(36), ForeignKey('departments.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    aliases = relationship('WatchlistAlias', back_populates='entity', cascade='all, delete-orphan')
    alerts = relationship('Alert', back_populates='watchlist_entity')

class WatchlistAlias(Base):
    __tablename__ = 'watchlist_aliases'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(36), ForeignKey('watchlist_entities.id', ondelete='CASCADE'), nullable=False)
    alias = Column(String(100), nullable=False)
    normalization_type = Column(String(50), default='PLATE_NORMALIZED', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    entity = relationship('WatchlistEntity', back_populates='aliases')

class Alert(Base):
    __tablename__ = 'alerts'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(100), ForeignKey('detection_events.event_id', ondelete='CASCADE'), nullable=False)
    entity_id = Column(String(36), ForeignKey('watchlist_entities.id', ondelete='CASCADE'), nullable=False)
    severity = Column(String(20), default='HIGH', nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW
    state = Column(String(30), default='NEW', nullable=False, index=True) # NEW, ACKNOWLEDGED, DISPATCHED, RESOLVED, FALSE_POSITIVE
    notes = Column(Text, nullable=True)
    dispatch_unit = Column(String(100), nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    detection_event = relationship('DetectionEvent', back_populates='alerts')
    watchlist_entity = relationship('WatchlistEntity', back_populates='alerts')

    @property
    def camera_name(self) -> Optional[str]:
        if self.detection_event and self.detection_event.camera:
            return self.detection_event.camera.name
        return None

    @property
    def camera_code(self) -> Optional[str]:
        if self.detection_event and self.detection_event.camera:
            return self.detection_event.camera.camera_code
        return None

    @property
    def department_name(self) -> Optional[str]:
        if self.detection_event and self.detection_event.camera and self.detection_event.camera.department:
            return self.detection_event.camera.department.name
        return None

    @property
    def latitude(self) -> Optional[float]:
        if self.detection_event:
            return self.detection_event.latitude
        return None

    @property
    def longitude(self) -> Optional[float]:
        if self.detection_event:
            return self.detection_event.longitude
        return None

    @property
    def target_identifier(self) -> Optional[str]:
        if self.watchlist_entity:
            return self.watchlist_entity.identifier
        return None

    @property
    def detected_identifier(self) -> Optional[str]:
        if self.detection_event and isinstance(self.detection_event.identifier, dict):
            return self.detection_event.identifier.get("raw")
        return self.target_identifier

    @property
    def watchlist_category(self) -> Optional[str]:
        if self.watchlist_entity:
            return self.watchlist_entity.category
        return "GENERAL"

    @property
    def occurred_at(self) -> Optional[datetime]:
        if self.detection_event:
            return self.detection_event.occurred_at
        return self.created_at

    @property
    def confidence(self) -> float:
        if self.detection_event:
            return self.detection_event.confidence
        return 0.95

    __table_args__ = (
        Index('idx_alert_state_severity', 'state', 'severity'),
    )

class CameraHealth(Base):
    __tablename__ = 'camera_health'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False, index=True)
    last_seen = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    state = Column(String(30), default='UNKNOWN', nullable=False) # ONLINE, OFFLINE, DEGRADED, UNKNOWN
    latency_ms = Column(Float, nullable=True)
    fps = Column(Float, nullable=True)
    bitrate = Column(Float, nullable=True)
    codec = Column(String(50), nullable=True)
    reason = Column(String(500), nullable=True)
    recorded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    camera = relationship('Camera', back_populates='health_records')

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor = Column(String(100), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    target = Column(String(255), nullable=True)
    department_context = Column(String(50), nullable=True)
    request_id = Column(String(100), nullable=True)
    source_ip = Column(String(50), nullable=True)
    result = Column(String(50), default='SUCCESS', nullable=False)
    reason = Column(Text, nullable=True)
    timestamp_utc = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

class IntegrationConfig(Base):
    __tablename__ = 'integration_configs'

    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(String(50), unique=True, nullable=False) # VAHAN, SARTHI, eGujCop, AFIS, NAFIS
    base_url = Column(String(500), nullable=False)
    credential_ref = Column(String(255), nullable=True)
    enabled = Column(Boolean, default=False, nullable=False)
    health = Column(String(30), default='UNKNOWN', nullable=False)
    last_checked = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
