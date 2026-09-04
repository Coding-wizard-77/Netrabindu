import pytest
from datetime import datetime, timezone

def test_auth_login_and_me(client):
    # Valid login
    res = client.post("/api/auth/login", json={"username": "admin_test", "password": "AdminPass123!"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin_test"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "admin_test"

    # Invalid login
    bad_res = client.post("/api/auth/login", json={"username": "admin_test", "password": "WrongPassword"})
    assert bad_res.status_code == 401

def test_departments_list(client, admin_token):
    res = client.get("/api/departments", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    depts = res.json()
    assert len(depts) >= 1
    assert depts[0]["code"] == "DEPT-TEST"

def test_camera_crud_and_stream(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create camera
    cam_payload = {
        "camera_code": "CAM-INT-01",
        "name": "Integration Test Camera",
        "department_id": "DEPT-TEST",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "vendor": "Generic",
        "model": "IP-1080p",
        "source_type": "DIRECT_RTSP",
        "protocol": "RTSP",
        "endpoint": "rtsp://10.0.0.1:554/stream",
        "retention_days": 15,
        "analytics_profile": "ANPR"
    }
    create_res = client.post("/api/cameras", json=cam_payload, headers=headers)
    assert create_res.status_code == 201
    cam = create_res.json()
    cam_id = cam["id"]

    # 2. List cameras
    list_res = client.get("/api/cameras", headers=headers)
    assert list_res.status_code == 200
    assert any(c["id"] == cam_id for c in list_res.json())

    # 3. Get camera details
    detail_res = client.get(f"/api/cameras/{cam_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["camera_code"] == "CAM-INT-01"

    # 4. Get stream session
    stream_res = client.get(f"/api/cameras/{cam_id}/stream", headers=headers)
    assert stream_res.status_code == 200
    stream_data = stream_res.json()
    assert "webrtc_url" in stream_data
    assert "hls_url" in stream_data

def test_event_ingest_and_search(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create camera first
    cam_res = client.post("/api/cameras", json={
        "camera_code": "CAM-EVT-01",
        "name": "Event Ingest Camera",
        "department_id": "DEPT-TEST",
        "latitude": 23.03,
        "longitude": 72.58,
        "endpoint": "rtsp://localhost/stream"
    }, headers=headers)
    cam_id = cam_res.json()["id"]

    # Ingest detection event
    event_payload = {
        "event_id": "evt_int_test_01",
        "event_type": "ANPR",
        "camera_id": cam_id,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "identifier": {
            "type": "vehicle_plate",
            "raw": "GJ 01 Z 9999",
            "normalized": "GJ01Z9999",
            "confidence": 0.96
        },
        "confidence": 0.96
    }
    ingest_res = client.post("/api/events", json=event_payload)
    assert ingest_res.status_code == 201

    # Search events
    search_res = client.get(f"/api/events?camera_id={cam_id}", headers=headers)
    assert search_res.status_code == 200
    events = search_res.json()
    assert len(events) >= 1
    assert events[0]["event_id"] == "evt_int_test_01"

def test_watchlist_and_alert_flow(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Watchlist Entity
    wl_res = client.post("/api/watchlists", json={
        "entity_type": "VEHICLE",
        "identifier": "GJ 01 WL 5555",
        "category": "STOLEN",
        "priority": "CRITICAL",
        "source_ref": "FIR-INT-001"
    }, headers=headers)
    assert wl_res.status_code == 201
    entity = wl_res.json()
    assert entity["normalized_identifier"] == "GJ01WL5555"

    # 2. Diagnostic Match API
    diag_res = client.post("/api/watchlists/match", json={
        "identifier": "GJ01WL5555",
        "confidence": 0.95
    }, headers=headers)
    assert diag_res.status_code == 200
    assert diag_res.json()["matched"] is True

    # 3. Ingest event matching this plate -> triggers Alert
    cam_res = client.post("/api/cameras", json={
        "camera_code": "CAM-ALERT-INT",
        "name": "Alert Flow Cam",
        "department_id": "DEPT-TEST",
        "latitude": 23.05,
        "longitude": 72.60,
        "endpoint": "rtsp://localhost/alert_cam"
    }, headers=headers)
    cam_id = cam_res.json()["id"]

    ingest_res = client.post("/api/events", json={
        "event_id": "evt_alert_test_01",
        "event_type": "ANPR",
        "camera_id": cam_id,
        "identifier": {"raw": "GJ 01 WL 5555", "confidence": 0.95},
        "confidence": 0.95
    })
    assert ingest_res.status_code == 201

    # 4. Query alerts
    alerts_res = client.get("/api/alerts?severity=CRITICAL", headers=headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    matched_alert = next((a for a in alerts if a["event_id"] == "evt_alert_test_01"), None)
    assert matched_alert is not None
    assert matched_alert["state"] == "NEW"

    # 5. Acknowledge alert
    ack_res = client.post(
        f"/api/alerts/{matched_alert['id']}/acknowledge",
        json={"notes": "Visual match confirmed by operator"},
        headers=headers
    )
    assert ack_res.status_code == 200
    assert ack_res.json()["state"] == "ACKNOWLEDGED"

def test_system_health_and_metrics_endpoints(client):
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert "status" in health_res.json()

    metrics_res = client.get("/api/metrics?format=json")
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    assert "cameras" in data
    assert "events_total" in data

    prom_res = client.get("/api/metrics")
    assert prom_res.status_code == 200
    assert b"netrabindu_" in prom_res.content
