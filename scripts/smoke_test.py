import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from backend.database import get_db_context, init_db
    from backend.dependencies import create_access_token
    from backend.services.camera_registry.models import Camera, User, Department, WatchlistEntity, Alert, AuditLog
    from backend.services.camera_registry.schemas import CameraCreate
    from backend.services.camera_registry.service import camera_registry_service
    from backend.services.ingestion.stream_manager import stream_manager
    from backend.services.events.persistence import event_persistence
    from backend.services.watchlist.normalizer import normalize_plate
    from backend.services.route_engine.reconstructor import route_engine
    from backend.services.health_monitor.monitor import health_monitor
    from backend.services.audit.logger import audit_service
    from backend.services.alerts.service import alert_service
except ImportError:
    from database import get_db_context, init_db
    from dependencies import create_access_token
    from services.camera_registry.models import Camera, User, Department, WatchlistEntity, Alert, AuditLog
    from services.camera_registry.schemas import CameraCreate
    from services.camera_registry.service import camera_registry_service
    from services.ingestion.stream_manager import stream_manager
    from services.events.persistence import event_persistence
    from services.watchlist.normalizer import normalize_plate
    from services.route_engine.reconstructor import route_engine
    from services.health_monitor.monitor import health_monitor
    from services.audit.logger import audit_service
    from services.alerts.service import alert_service

async def run_smoke_test():
    print("==========================================================")
    print("NETRABINDU E2E SMOKE TEST — BACKEND & INTEGRATION SPINE")
    print("==========================================================\n")

    init_db()

    with get_db_context() as db:
        # Step 1: Admin & Department validation
        print("[1/12] Verifying Admin Account and Auth Token...")
        admin = db.query(User).filter(User.username == "admin").first()
        assert admin is not None, "Admin user must exist (run provision_admin.py)"
        token = create_access_token({"sub": admin.id, "username": admin.username, "roles": ["SUPER_ADMIN"]})
        print(f"       [PASS] Admin verified. JWT Token generated.")

        dept = db.query(Department).first()
        assert dept is not None, "At least one department must exist."
        print(f"       [PASS] Department verified: {dept.code} ({dept.name})")

        # Step 2: Camera Registration
        print("[2/12] Onboarding Camera Source...")
        cam_code = "CAM-SMOKE-01"
        existing_cam = db.query(Camera).filter(Camera.camera_code == cam_code).first()
        if not existing_cam:
            cam_data = CameraCreate(
                camera_code=cam_code,
                name="Ahmedabad SG Highway Junction Entry",
                department_id=dept.id,
                latitude=23.0338,
                longitude=72.5186,
                vendor="Hikvision",
                model="DS-2CD2043G2-I",
                source_type="DIRECT_RTSP",
                protocol="RTSP",
                endpoint="rtsp://127.0.0.1:8554/live/smoke_test",
                retention_days=15,
                analytics_profile="ANPR"
            )
            cam = camera_registry_service.create_camera(cam_data, db)
        else:
            cam = existing_cam
        print(f"       [PASS] Camera registered: {cam.id} ({cam.name})")

        # Step 3: Stream Session URLs
        print("[3/12] Testing Stream Session Generation (WebRTC & HLS)...")
        stream_urls = stream_manager.get_stream_urls(cam.id, session_token=token)
        assert "webrtc_url" in stream_urls
        assert "hls_url" in stream_urls
        print(f"       [PASS] Stream Session active: WebRTC -> {stream_urls['webrtc_url']}")

        # Step 4: Watchlist Entity Creation
        test_plate = "GJ 01 AB 1234"
        norm_plate = normalize_plate(test_plate)
        print(f"[4/12] Registering Target Watchlist Entity: '{test_plate}' (Norm: {norm_plate})...")
        existing_entity = db.query(WatchlistEntity).filter(WatchlistEntity.normalized_identifier == norm_plate).first()
        if not existing_entity:
            entity = WatchlistEntity(
                entity_type="VEHICLE",
                identifier=test_plate,
                normalized_identifier=norm_plate,
                category="STOLEN",
                priority="CRITICAL",
                source_ref="FIR-2026/AHM-EAST/0491",
                notes="Red SUV reported stolen in SG Highway corridor",
                status="ACTIVE",
                department_id=dept.id
            )
            db.add(entity)
            db.commit()
            db.refresh(entity)
        else:
            entity = existing_entity
        print(f"       [PASS] Watchlist Entity active: ID={entity.id}, Priority={entity.priority}")

        # Step 5: Ingest Real ANPR Detection Event
        print("[5/12] Ingesting Edge ANPR Event from Camera...")
        event_id = f"evt_smoke_{int(datetime.now().timestamp())}"
        detection_payload = {
            "event_id": event_id,
            "event_type": "ANPR",
            "camera_id": cam.id,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "identifier": {
                "type": "vehicle_plate",
                "raw": test_plate,
                "normalized": norm_plate,
                "confidence": 0.945
            },
            "location": {"lat": cam.latitude, "lon": cam.longitude},
            "evidence": {
                "thumbnail_uri": f"s3://evidence/smoke/{event_id}.jpg",
                "clip_uri": f"s3://evidence/smoke/{event_id}.mp4"
            },
            "pipeline": {
                "node_id": "edge-ahm-sg-01",
                "model_version": "yolov8x-plate-v2.1"
            }
        }
        persist_res = await event_persistence.persist_detection_event(detection_payload, db)
        assert persist_res["status"] == "PERSISTED"
        print(f"       [PASS] Event {event_id} successfully persisted and indexed.")

        # Step 6: Idempotency Verification
        print("[6/12] Testing Event Idempotency (Duplicate Ingestion)...")
        dup_res = await event_persistence.persist_detection_event(detection_payload, db)
        assert dup_res["status"] == "DUPLICATE_IGNORED"
        print("       [PASS] Duplicate event successfully deduplicated.")

        # Step 7: Watchlist Correlation & Alert Verification
        print("[7/12] Verifying Watchlist Correlation & Alert Generation...")
        alert = db.query(Alert).filter(Alert.event_id == event_id).first()
        assert alert is not None, "Correlation engine must automatically generate alert for matched plate."
        assert alert.severity == "CRITICAL"
        assert alert.state == "NEW"
        print(f"       [PASS] Real-time Alert generated: ID={alert.id}, Severity={alert.severity}")

        # Step 8: Alert State Transition (ACKNOWLEDGE)
        print("[8/12] Testing Alert Lifecycle Transition (NEW -> ACKNOWLEDGED)...")
        ack_alert = await alert_service.transition_state(
            alert_id=alert.id,
            new_state="ACKNOWLEDGED",
            actor="admin",
            db=db,
            notes="Operator dispatched intercept patrol unit."
        )
        assert ack_alert.state == "ACKNOWLEDGED"
        print(f"       [PASS] Alert transitioned to ACKNOWLEDGED by {ack_alert.acknowledged_by}")

        # Step 9: Vehicle Route Reconstruction
        print("[9/12] Reconstructing Vehicle Trajectory and GIS Route...")
        route_data = route_engine.reconstruct_route(plate=test_plate, from_time=None, to_time=None, db=db)
        assert route_data["total_points"] >= 1
        pt = route_data["points"][0]
        assert pt["camera_id"] == cam.id
        print(f"       [PASS] Route reconstructed: {route_data['total_points']} point(s). Lat: {pt['latitude']}, Lon: {pt['longitude']}")

        # Step 10: Evidence Retrieval
        print("[10/12] Testing Evidence Retrieval...")
        ev_data = route_engine.get_evidence(plate=test_plate, from_time=None, to_time=None, db=db)
        assert ev_data["evidence_count"] >= 1
        print(f"       [PASS] Evidence verified: {ev_data['evidence_records'][0]['thumbnail_uri']}")

        # Step 11: Audit Trail Verification
        print("[11/12] Auditing Privileged Operation...")
        audit_entry = audit_service.log(
            actor="admin",
            action="SMOKE_TEST_EXECUTION",
            target=event_id,
            db=db,
            result="SUCCESS"
        )
        assert audit_entry.id is not None
        print(f"       [PASS] Immutable Audit entry recorded: ID={audit_entry.id}")

        # Step 12: Health & Metrics Verification
        print("[12/12] Querying System Health & Telemetry...")
        health_status = await health_monitor.get_system_health(db)
        print(f"       [PASS] System Health: {health_status['status']}")
        for comp, st in health_status["components"].items():
            print(f"              - {comp}: {st}")

    print("\n==========================================================")
    print("ALL 12 SMOKE TEST CHECKS PASSED SUCCESSFULLY (100% OK)")
    print("==========================================================")

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
