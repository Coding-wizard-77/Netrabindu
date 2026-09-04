import pytest
import uuid
from datetime import datetime, timezone
from backend.services.camera_registry.models import DetectionEvent, WatchlistEntity, Alert, Camera, Department
from backend.services.alerts.service import alert_service

@pytest.mark.asyncio
async def test_alert_lifecycle_transitions(db_session):
    dept = db_session.query(Department).first()
    cam = Camera(
        camera_code="CAM-ALERT-01",
        name="Test Junction Cam",
        department_id=dept.id,
        latitude=23.0,
        longitude=72.0,
        status="ONLINE"
    )
    db_session.add(cam)
    db_session.flush()

    evt_id = f"evt_{uuid.uuid4().hex[:12]}"
    event = DetectionEvent(
        event_id=evt_id,
        camera_id=cam.id,
        event_type="ANPR",
        identifier={"raw": "GJ01AB1234", "confidence": 0.95},
        occurred_at=datetime.now(timezone.utc),
        confidence=0.95,
        latitude=23.0,
        longitude=72.0
    )
    db_session.add(event)

    entity = WatchlistEntity(
        identifier="GJ01AB1234",
        normalized_identifier="GJ01AB1234",
        category="STOLEN",
        priority="CRITICAL",
        status="ACTIVE"
    )
    db_session.add(entity)
    db_session.commit()

    # Step 1: Create Alert
    alert = await alert_service.create_alert(
        event_id=evt_id,
        entity_id=entity.id,
        severity="CRITICAL",
        notes="Stolen vehicle detected",
        db=db_session
    )
    assert alert.state == "NEW"
    assert alert.severity == "CRITICAL"

    # Step 2: Acknowledge
    ack = await alert_service.transition_state(
        alert_id=alert.id,
        new_state="ACKNOWLEDGED",
        actor="operator_1",
        db=db_session,
        notes="Operator acknowledged visual hit"
    )
    assert ack.state == "ACKNOWLEDGED"
    assert ack.acknowledged_by == "operator_1"

    # Step 3: Dispatch
    disp = await alert_service.transition_state(
        alert_id=alert.id,
        new_state="DISPATCHED",
        actor="operator_1",
        db=db_session,
        dispatch_unit="Highway Patrol 04"
    )
    assert disp.state == "DISPATCHED"
    assert disp.dispatch_unit == "Highway Patrol 04"

    # Step 4: Resolve
    res = await alert_service.transition_state(
        alert_id=alert.id,
        new_state="RESOLVED",
        actor="operator_1",
        db=db_session,
        notes="Vehicle intercepted"
    )
    assert res.state == "RESOLVED"
    assert res.resolved_by == "operator_1"

    # Step 5: Disallowed Transition (Cannot transition from RESOLVED to NEW)
    with pytest.raises(ValueError, match="Illegal state transition"):
        await alert_service.transition_state(
            alert_id=alert.id,
            new_state="NEW",
            actor="operator_1",
            db=db_session
        )
