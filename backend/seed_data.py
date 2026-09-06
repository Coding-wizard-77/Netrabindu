import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(backend_dir.parent) not in sys.path:
    sys.path.insert(0, str(backend_dir.parent))

import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.database import get_db_context, init_db
from backend.dependencies import hash_password
from backend.services.camera_registry.models import (
    Department, Role, User, Camera, CameraSource, CameraAdaptiveProfile,
    CameraCapability, WatchlistEntity, WatchlistAlias, DetectionEvent, VehicleRead
)

DEPARTMENTS_SEED = [
    {"code": "HOME-POLICE", "name": "Home Department (Gujarat Police)", "jurisdiction": "Statewide Gujarat"},
    {"code": "GSRTC", "name": "Gujarat State Road Transport Corporation", "jurisdiction": "Statewide Transport Corridors"},
    {"code": "HEALTH", "name": "Health and Family Welfare Department", "jurisdiction": "State Civil Hospitals and Trauma Centers"},
    {"code": "PANCHAYAT", "name": "Panchayat and Rural Development Department", "jurisdiction": "Rural Roads, GIDC and Tolls"},
    {"code": "MUNICIPAL", "name": "Urban Development and Municipal Corporations", "jurisdiction": "AMC, SMC, VMC, RMC Urban Areas"}
]

CAMERAS_SEED = [
    {"code": "GJ-POL-CAM-01", "name": "S.G. Highway - Pakwan Cross Road", "dept": "HOME-POLICE", "lat": 23.0330, "lon": 72.5120, "addr": "S.G. Highway, Bodakdev, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-POL-CAM-02", "name": "S.G. Highway - Iskcon Flyover Junction", "dept": "HOME-POLICE", "lat": 23.0275, "lon": 72.5080, "addr": "Iskcon Cross Road, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-POL-CAM-03", "name": "S.G. Highway - Gota Cross Road Checkpost", "dept": "HOME-POLICE", "lat": 23.0780, "lon": 72.5290, "addr": "Gota Flyover, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-POL-CAM-04", "name": "Gandhinagar - Sector 18 Police Bhawan", "dept": "HOME-POLICE", "lat": 23.2156, "lon": 72.6369, "addr": "Sector 18, Gandhinagar", "codec": "H.265"},
    {"code": "GJ-POL-CAM-05", "name": "Mahatma Mandir - Expressway Toll Plaza", "dept": "HOME-POLICE", "lat": 23.2300, "lon": 72.6650, "addr": "Kh Road, Gandhinagar", "codec": "H.264"},
    {"code": "GJ-POL-CAM-06", "name": "Surat - Varachha Main Road Checkpost", "dept": "HOME-POLICE", "lat": 21.2144, "lon": 72.8634, "addr": "Varachha, Surat", "codec": "H.265"},
    {"code": "GJ-POL-CAM-07", "name": "Surat - Athwa Gate Traffic Intersection", "dept": "HOME-POLICE", "lat": 21.1860, "lon": 72.8080, "addr": "Athwa Lines, Surat", "codec": "H.264"},
    {"code": "GJ-POL-CAM-08", "name": "Vadodara - Alkapuri Railway Underpass", "dept": "HOME-POLICE", "lat": 22.3100, "lon": 73.1700, "addr": "Alkapuri, Vadodara", "codec": "H.265"},
    {"code": "GJ-POL-CAM-09", "name": "Rajkot - Yagnik Road Tri-Junction", "dept": "HOME-POLICE", "lat": 22.2960, "lon": 70.7980, "addr": "Dr. Yagnik Rd, Rajkot", "codec": "H.264"},
    {"code": "GJ-POL-CAM-10", "name": "Valsad - Coastal Border Checkpoint", "dept": "HOME-POLICE", "lat": 20.6100, "lon": 72.9300, "addr": "NH-48 Border, Valsad", "codec": "H.264"},
    {"code": "GJ-POL-CAM-11", "name": "Dahod - Inter-State Border Police Post", "dept": "HOME-POLICE", "lat": 22.8300, "lon": 74.2600, "addr": "Dahod Border Checkpost", "codec": "H.265"},
    {"code": "GJ-POL-CAM-12", "name": "Dwarka - Highway Coastal Entry Gate", "dept": "HOME-POLICE", "lat": 22.2400, "lon": 68.9700, "addr": "Dwarka Coastal Highway", "codec": "H.264"},

    {"code": "GJ-RTC-CAM-13", "name": "Ranip Central Bus Terminal - Ingate", "dept": "GSRTC", "lat": 23.0645, "lon": 72.5802, "addr": "Ranip Bus Port, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-14", "name": "Ranip Central Bus Terminal - Outgate", "dept": "GSRTC", "lat": 23.0650, "lon": 72.5810, "addr": "Ranip Bus Port, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-15", "name": "Geeta Mandir Central Bus Station", "dept": "GSRTC", "lat": 23.0120, "lon": 72.5930, "addr": "Geeta Mandir, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-16", "name": "Vadodara Central Bus Depot - Bay 1-6", "dept": "GSRTC", "lat": 22.3120, "lon": 73.1810, "addr": "Station Road, Vadodara", "codec": "H.265"},
    {"code": "GJ-RTC-CAM-17", "name": "Surat Central ST Bus Port - Main Entry", "dept": "GSRTC", "lat": 21.2050, "lon": 72.8410, "addr": "Railway Station Area, Surat", "codec": "H.265"},
    {"code": "GJ-RTC-CAM-18", "name": "Rajkot Central Bus Station - Platform A", "dept": "GSRTC", "lat": 22.3020, "lon": 70.8030, "addr": "Dhebar Rd, Rajkot", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-19", "name": "Mehsana Divisional ST Workshop", "dept": "GSRTC", "lat": 23.6000, "lon": 72.4000, "addr": "Mehsana Highway Depot", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-20", "name": "Bhavnagar ST Bus Stand - North Concourse", "dept": "GSRTC", "lat": 21.7645, "lon": 72.1519, "addr": "ST Depot, Bhavnagar", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-21", "name": "Somnath Transit Station - Bus Concourse", "dept": "GSRTC", "lat": 20.8980, "lon": 70.4010, "addr": "Prabhas Patan, Somnath", "codec": "H.264"},
    {"code": "GJ-RTC-CAM-22", "name": "Godhra ST Division Highway Point", "dept": "GSRTC", "lat": 22.7750, "lon": 73.6150, "addr": "Godhra Bypass Depot", "codec": "H.264"},

    {"code": "GJ-HLT-CAM-23", "name": "Ahmedabad Civil Hospital - Trauma Center 1", "dept": "HEALTH", "lat": 23.0530, "lon": 72.6040, "addr": "Asarwa, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-24", "name": "Ahmedabad Civil Hospital - Emergency Gate", "dept": "HEALTH", "lat": 23.0540, "lon": 72.6050, "addr": "Asarwa, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-25", "name": "Sola Civil Hospital - S.G. Highway Entry", "dept": "HEALTH", "lat": 23.0760, "lon": 72.5270, "addr": "S.G. Highway, Sola, Ahmedabad", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-26", "name": "Surat New Civil Hospital - Main Gate", "dept": "HEALTH", "lat": 21.1730, "lon": 72.8190, "addr": "Majura Gate, Surat", "codec": "H.265"},
    {"code": "GJ-HLT-CAM-27", "name": "Vadodara SSG Hospital - Casualty Concourse", "dept": "HEALTH", "lat": 22.3080, "lon": 73.1930, "addr": "Jail Road, Vadodara", "codec": "H.265"},
    {"code": "GJ-HLT-CAM-28", "name": "Rajkot PDU Medical Hospital - Gate 2", "dept": "HEALTH", "lat": 22.3040, "lon": 70.7960, "addr": "Jamnagar Rd, Rajkot", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-29", "name": "Gandhinagar GMERS Hospital - Ambulance Bay", "dept": "HEALTH", "lat": 23.2200, "lon": 72.6450, "addr": "Sector 12, Gandhinagar", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-30", "name": "Bhavnagar Sir T Hospital - Casualty Entry", "dept": "HEALTH", "lat": 21.7700, "lon": 72.1450, "addr": "Kalanala, Bhavnagar", "codec": "H.264"},
    {"code": "GJ-HLT-CAM-31", "name": "Jamnagar GG Hospital - Emergency Gate", "dept": "HEALTH", "lat": 22.4700, "lon": 70.0700, "addr": "Indira Marg, Jamnagar", "codec": "H.264"},

    {"code": "GJ-PAN-CAM-32", "name": "Koba Circle Checkpoint - Rural Arterial", "dept": "PANCHAYAT", "lat": 23.1550, "lon": 72.6320, "addr": "Koba Circle, Gandhinagar Rural", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-33", "name": "Sanand GIDC Industrial Corridor Junction", "dept": "PANCHAYAT", "lat": 22.9980, "lon": 72.3800, "addr": "Sanand GIDC Phase 2, Ahmedabad Rural", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-34", "name": "Bavla Rural Highway Checkpost", "dept": "PANCHAYAT", "lat": 22.8360, "lon": 72.3650, "addr": "NH-47, Bavla Rural", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-35", "name": "Dholera SIR Smart City Highway Entry", "dept": "PANCHAYAT", "lat": 22.2500, "lon": 72.1900, "addr": "Dholera Express Highway", "codec": "H.265"},
    {"code": "GJ-PAN-CAM-36", "name": "Viramgam Crossroad Highway Monitor", "dept": "PANCHAYAT", "lat": 23.1200, "lon": 72.0300, "addr": "Viramgam Rural Junction", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-37", "name": "Halol GIDC Industrial Access Road", "dept": "PANCHAYAT", "lat": 22.5000, "lon": 73.4700, "addr": "Halol Rural, Panchmahal", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-38", "name": "Ankleshwar GIDC Chemical Zone Toll", "dept": "PANCHAYAT", "lat": 21.6300, "lon": 73.0000, "addr": "Ankleshwar Rural, Bharuch", "codec": "H.265"},
    {"code": "GJ-PAN-CAM-39", "name": "Chhatral GIDC Highway Junction", "dept": "PANCHAYAT", "lat": 23.3300, "lon": 72.4400, "addr": "Chhatral, Kalol Rural", "codec": "H.264"},
    {"code": "GJ-PAN-CAM-40", "name": "Mundra Port Access Corridor Point", "dept": "PANCHAYAT", "lat": 22.8400, "lon": 69.7200, "addr": "Mundra Rural, Kutch", "codec": "H.264"},

    {"code": "GJ-MUN-CAM-41", "name": "Ahmedabad - Sabarmati Riverfront Promenade", "dept": "MUNICIPAL", "lat": 23.0380, "lon": 72.5740, "addr": "Riverfront West, AMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-42", "name": "Ahmedabad - Kankaria Lake South Concourse", "dept": "MUNICIPAL", "lat": 22.9990, "lon": 72.6020, "addr": "Kankaria Lake, Maninagar, AMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-43", "name": "Ahmedabad - C.G. Road Panchvati Cross", "dept": "MUNICIPAL", "lat": 23.0240, "lon": 72.5560, "addr": "C.G. Road, Navrangpura, AMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-44", "name": "Surat - Dumas Road VR Mall Junction", "dept": "MUNICIPAL", "lat": 21.1480, "lon": 72.7560, "addr": "Dumas Road, Magdalla, SMC", "codec": "H.265"},
    {"code": "GJ-MUN-CAM-45", "name": "Surat - Ring Road Textile Market Flyover", "dept": "MUNICIPAL", "lat": 21.1920, "lon": 72.8450, "addr": "Ring Road, Surat, SMC", "codec": "H.265"},
    {"code": "GJ-MUN-CAM-46", "name": "Vadodara - Sayajigunj Kala Ghoda Circle", "dept": "MUNICIPAL", "lat": 22.3110, "lon": 73.1890, "addr": "Sayajigunj, Vadodara, VMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-47", "name": "Vadodara - Akota Dandia Bazar Bridge", "dept": "MUNICIPAL", "lat": 22.2980, "lon": 73.1850, "addr": "Akota, Vadodara, VMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-48", "name": "Rajkot - Kalawad Road KKV Hall Chowk", "dept": "MUNICIPAL", "lat": 22.2850, "lon": 70.7680, "addr": "Kalawad Road, RMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-49", "name": "Gandhinagar - CH-0 Central Vista Circle", "dept": "MUNICIPAL", "lat": 23.2100, "lon": 72.6500, "addr": "Central Vista, GMC", "codec": "H.264"},
    {"code": "GJ-MUN-CAM-50", "name": "Bhavnagar - Ghogha Circle Traffic Point", "dept": "MUNICIPAL", "lat": 21.7580, "lon": 72.1380, "addr": "Ghogha Road, BMC", "codec": "H.264"}
]

def seed_all_data():
    init_db()
    with get_db_context() as db:
        print("Checking and seeding core departments...")
        dept_map = {}
        for d in DEPARTMENTS_SEED:
            dept = db.query(Department).filter(Department.code == d["code"]).first()
            if not dept:
                dept = Department(
                    id=str(uuid.uuid4()),
                    code=d["code"],
                    name=d["name"],
                    jurisdiction=d["jurisdiction"],
                    status="ACTIVE"
                )
                db.add(dept)
                db.flush()
            dept_map[d["code"]] = dept

        print("Checking roles and master admin...")
        role_admin = db.query(Role).filter(Role.name == "SUPER_ADMIN").first()
        if not role_admin:
            role_admin = Role(id=str(uuid.uuid4()), name="SUPER_ADMIN", description="Master Police Administrator")
            db.add(role_admin)
            db.flush()

        role_op = db.query(Role).filter(Role.name == "OPERATOR").first()
        if not role_op:
            role_op = Role(id=str(uuid.uuid4()), name="OPERATOR", description="Control Room Operator")
            db.add(role_op)
            db.flush()

        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                username="admin",
                password_hash=hash_password("GujaratPolice@2026"),
                email="scrb.sentinel@police.gujarat.gov.in",
                department_id=dept_map["HOME-POLICE"].id,
                status="ACTIVE"
            )
            admin_user.roles.append(role_admin)
            db.add(admin_user)
            db.flush()
            print("Master Admin created: admin / GujaratPolice@2026")

        print("Checking and seeding 50 Gujarat Government Cameras...")
        camera_map = {}
        for c in CAMERAS_SEED:
            cam = db.query(Camera).filter(Camera.camera_code == c["code"]).first()
            dept = dept_map[c["dept"]]
            if not cam:
                cam = Camera(
                    id=str(uuid.uuid4()),
                    camera_code=c["code"],
                    name=c["name"],
                    department_id=dept.id,
                    latitude=c["lat"],
                    longitude=c["lon"],
                    address=c["addr"],
                    vendor="Hikvision/Dahua Government Certified",
                    model="DS-2CD-GujaratSentinel",
                    source_type="DIRECT_RTSP",
                    protocol="RTSP",
                    status="ONLINE",
                    retention_days=15,
                    analytics_profile="ANPR"
                )
                db.add(cam)
                db.flush()

                source = CameraSource(
                    id=str(uuid.uuid4()),
                    camera_id=cam.id,
                    source_kind="MAIN_STREAM",
                    endpoint=f"rtsp://localhost:8554/stream/{cam.camera_code.lower()}",
                    enabled=True
                )
                db.add(source)

                adaptive = CameraAdaptiveProfile(
                    camera_id=cam.id,
                    quality_states={
                        "idle": {"fps": 2, "res": "480p", "bitrate_kbps": 256},
                        "normal": {"fps": 10, "res": "720p", "bitrate_kbps": 1024},
                        "active": {"fps": 20, "res": "1080p", "bitrate_kbps": 2048},
                        "critical": {"fps": 25, "res": "1080p", "bitrate_kbps": 4096}
                    },
                    activity_thresholds={"motion_trigger": 0.35},
                    cooldowns={"state_cooldown_seconds": 30},
                    stream_profiles={},
                    inference_tiers={"idle": "SENTINEL", "normal": "DETECTOR", "active": "CASCADED_TASK", "critical": "FULL"},
                    pre_event_buffer_seconds=10
                )
                db.add(adaptive)

                cap = CameraCapability(
                    camera_id=cam.id,
                    capability_json={"anpr": True, "webrtc": True, "h265": (c["codec"] == "H.265"), "tcp_transport": True}
                )
                db.add(cap)

            camera_map[c["code"]] = cam

        print("Checking and seeding Watchlists...")
        wl_entity1 = db.query(WatchlistEntity).filter(WatchlistEntity.identifier == "GJ01AB1234").first()
        if not wl_entity1:
            wl_entity1 = WatchlistEntity(
                id=str(uuid.uuid4()),
                entity_type="VEHICLE",
                identifier="GJ01AB1234",
                normalized_identifier="GJ01AB1234",
                category="STOLEN",
                priority="CRITICAL",
                source_ref="FIR CR-I/104/2026 (Vastrapur PS)",
                notes="Mahindra Scorpio S11 (White) - Armed Dacoity Escape Vehicle",
                status="ACTIVE",
                department_id=dept_map["HOME-POLICE"].id
            )
            db.add(wl_entity1)
            db.flush()

            alias1 = WatchlistAlias(
                id=str(uuid.uuid4()),
                entity_id=wl_entity1.id,
                alias="GJ 01 AB 1234",
                normalization_type="PLATE_NORMALIZED"
            )
            db.add(alias1)

        wl_entity2 = db.query(WatchlistEntity).filter(WatchlistEntity.identifier == "GJ01CD5678").first()
        if not wl_entity2:
            wl_entity2 = WatchlistEntity(
                id=str(uuid.uuid4()),
                entity_type="VEHICLE",
                identifier="GJ01CD5678",
                normalized_identifier="GJ01CD5678",
                category="WANTED",
                priority="HIGH",
                source_ref="FIR CR-II/42/2026",
                notes="Narcotics Transit Intercept",
                status="ACTIVE",
                department_id=dept_map["HOME-POLICE"].id
            )
            db.add(wl_entity2)

        print("Checking and seeding Evaluation Test Sighting History for GJ01AB1234...")
        existing_read = db.query(VehicleRead).filter(VehicleRead.normalized_plate == "GJ01AB1234").first()
        if not existing_read:
            now = datetime.now(timezone.utc)
            
            hops = [
                {"cam_code": "GJ-POL-CAM-01", "minutes_ago": 120, "conf": 0.98},
                {"cam_code": "GJ-POL-CAM-02", "minutes_ago": 113, "conf": 0.96},
                {"cam_code": "GJ-RTC-CAM-13", "minutes_ago": 97, "conf": 0.94},
                {"cam_code": "GJ-POL-CAM-03", "minutes_ago": 86, "conf": 0.97},
                # Gap between 86 mins ago and 62 mins ago (24 minute unobserved corridor transit)
                {"cam_code": "GJ-PAN-CAM-32", "minutes_ago": 62, "conf": 0.95},
                {"cam_code": "GJ-POL-CAM-04", "minutes_ago": 50, "conf": 0.99},
                {"cam_code": "GJ-POL-CAM-05", "minutes_ago": 41, "conf": 0.97},
            ]

            for h in hops:
                cam = camera_map.get(h["cam_code"])
                if not cam:
                    continue
                sighting_time = now - timedelta(minutes=h["minutes_ago"])
                ev = DetectionEvent(
                    event_id=f"EV-{uuid.uuid4().hex[:8].upper()}",
                    camera_id=cam.id,
                    event_type="ANPR",
                    identifier={"type": "vehicle_plate", "raw": "GJ 01 AB 1234", "normalized": "GJ01AB1234", "confidence": h["conf"]},
                    occurred_at=sighting_time,
                    confidence=h["conf"],
                    latitude=cam.latitude,
                    longitude=cam.longitude,
                    evidence_ref={
                        "thumbnail_uri": f"/evidence/crops/{cam.camera_code.lower()}_crop.jpg",
                        "clip_uri": f"/evidence/clips/{cam.camera_code.lower()}_clip.mp4",
                        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    },
                    pipeline={"yolo": "v11", "ocr": "paddleocr"}
                )
                db.add(ev)
                db.flush()

                vread = VehicleRead(
                    event_id=ev.event_id,
                    raw_plate="GJ 01 AB 1234",
                    normalized_plate="GJ01AB1234",
                    ocr_confidence=h["conf"],
                    read_time=sighting_time
                )
                db.add(vread)

        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_all_data()
