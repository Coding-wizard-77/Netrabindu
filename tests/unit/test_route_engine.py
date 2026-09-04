import pytest
from datetime import datetime, timedelta, timezone
from services.camera_registry.models import Camera, DetectionEvent, VehicleRead, Department
from services.route_engine.reconstructor import route_engine

def test_route_burst_deduplication_and_gaps(db_session):
    dept = db_session.query(Department).first()

    cam1 = Camera(camera_code="CAM-01", name="Junction 1", department_id=dept.id, latitude=23.01, longitude=72.50, status="ONLINE")
    cam2 = Camera(camera_code="CAM-02", name="Junction 2", department_id=dept.id, latitude=23.05, longitude=72.55, status="ONLINE")
    db_session.add_all([cam1, cam2])
    db_session.flush()

    t0 = datetime.now(timezone.utc) - timedelta(hours=1)
    plate = "GJ01AB9999"

    # Reading 1 at Cam 1 (t0)
    ev1 = DetectionEvent(event_id="e1", camera_id=cam1.id, event_type="ANPR", identifier={"raw": plate}, occurred_at=t0, confidence=0.88, latitude=23.01, longitude=72.50)
    vr1 = VehicleRead(event_id="e1", normalized_plate=plate, raw_plate=plate, ocr_confidence=0.88, read_time=t0)

    # Reading 2 at Cam 1 (t0 + 5 seconds, burst read) -> should be deduplicated
    t0_5s = t0 + timedelta(seconds=5)
    ev2 = DetectionEvent(event_id="e2", camera_id=cam1.id, event_type="ANPR", identifier={"raw": plate}, occurred_at=t0_5s, confidence=0.96, latitude=23.01, longitude=72.50)
    vr2 = VehicleRead(event_id="e2", normalized_plate=plate, raw_plate=plate, ocr_confidence=0.96, read_time=t0_5s)

    # Reading 3 at Cam 2 (t0 + 30 minutes, corridor gap) -> should trigger unobserved gap
    t0_30m = t0 + timedelta(minutes=30)
    ev3 = DetectionEvent(event_id="e3", camera_id=cam2.id, event_type="ANPR", identifier={"raw": plate}, occurred_at=t0_30m, confidence=0.94, latitude=23.05, longitude=72.55)
    vr3 = VehicleRead(event_id="e3", normalized_plate=plate, raw_plate=plate, ocr_confidence=0.94, read_time=t0_30m)

    db_session.add_all([ev1, vr1, ev2, vr2, ev3, vr3])
    db_session.commit()

    route = route_engine.reconstruct_route(plate=plate, from_time=None, to_time=None, db=db_session, burst_window_seconds=30)

    # 1. Total points should be 2 (cam1 and cam2), because ev2 was in the 30s burst window for cam1
    assert route["total_points"] == 2
    assert route["points"][0]["camera_id"] == cam1.id
    # The higher confidence read (0.96) was preserved
    assert route["points"][0]["confidence"] == 0.96
    assert route["points"][1]["camera_id"] == cam2.id

    # 2. Gaps should be identified because delta is 30 minutes (> 15 minutes default)
    assert len(route["gaps"]) == 1
    gap = route["gaps"][0]
    assert gap["reason"] == "UNOBSERVED_CORRIDOR_TRANSIT"
    assert gap["from_camera"] == "Junction 1"
    assert gap["to_camera"] == "Junction 2"
    assert gap["gap_seconds"] >= 1700
