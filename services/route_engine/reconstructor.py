from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc
from services.camera_registry.models import VehicleRead, DetectionEvent, Camera
from services.watchlist.normalizer import normalize_plate

class RouteEngine:
    """Reconstructs chronological vehicle trajectory and detects corridor gaps."""

    def __init__(self, default_burst_window_seconds: int = 30, gap_threshold_seconds: int = 900):
        self.default_burst_window_seconds = default_burst_window_seconds
        self.gap_threshold_seconds = gap_threshold_seconds  # 15 minutes gap threshold

    def get_timeline(
        self,
        plate: str,
        from_time: Optional[datetime],
        to_time: Optional[datetime],
        db: Session
    ) -> Dict[str, Any]:
        normalized = normalize_plate(plate)
        query = db.query(VehicleRead, DetectionEvent, Camera).join(
            DetectionEvent, VehicleRead.event_id == DetectionEvent.event_id
        ).join(
            Camera, DetectionEvent.camera_id == Camera.id
        ).filter(
            VehicleRead.normalized_plate == normalized
        )

        if from_time:
            query = query.filter(DetectionEvent.occurred_at >= from_time)
        if to_time:
            query = query.filter(DetectionEvent.occurred_at <= to_time)

        results = query.order_by(asc(DetectionEvent.occurred_at)).all()

        timeline_items = []
        for read, event, camera in results:
            ev_ref = event.evidence_ref or {}
            dept_name = camera.department.name if getattr(camera, "department", None) else ""
            timeline_items.append({
                "event_id": event.event_id,
                "occurred_at": event.occurred_at.isoformat(),
                "camera_id": camera.id,
                "camera_code": camera.camera_code,
                "camera_name": camera.name,
                "department_name": dept_name,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "location": {"lat": camera.latitude, "lon": camera.longitude},
                "raw_plate": read.raw_plate,
                "normalized_plate": read.normalized_plate,
                "ocr_confidence": read.ocr_confidence,
                "confidence": read.ocr_confidence,
                "evidence_ref": ev_ref,
                "thumbnail_uri": ev_ref.get("thumbnail_uri"),
                "clip_uri": ev_ref.get("clip_uri"),
            })

        return {
            "plate": plate,
            "normalized_plate": normalized,
            "from_time": from_time.isoformat() if from_time else (timeline_items[0]["occurred_at"] if timeline_items else ""),
            "to_time": to_time.isoformat() if to_time else (timeline_items[-1]["occurred_at"] if timeline_items else ""),
            "total_observations": len(timeline_items),
            "total_sightings": len(timeline_items),
            "unique_cameras": len(set(i["camera_id"] for i in timeline_items)),
            "events": timeline_items,
            "points": timeline_items
        }

    def reconstruct_route(
        self,
        plate: str,
        from_time: Optional[datetime],
        to_time: Optional[datetime],
        db: Session,
        burst_window_seconds: Optional[int] = None
    ) -> Dict[str, Any]:
        window = burst_window_seconds or self.default_burst_window_seconds
        timeline_data = self.get_timeline(plate, from_time, to_time, db)
        raw_events = timeline_data["events"]

        if not raw_events:
            return {
                "plate": plate,
                "normalized_plate": timeline_data["normalized_plate"],
                "from_time": from_time.isoformat() if from_time else "",
                "to_time": to_time.isoformat() if to_time else "",
                "total_sightings": 0,
                "total_points": 0,
                "unique_cameras": 0,
                "points": [],
                "gaps": []
            }

        # Step 6: Burst deduplication on same camera within window
        deduped_points = []
        last_point = None

        for ev in raw_events:
            ev_time = datetime.fromisoformat(ev["occurred_at"])
            if last_point is not None:
                last_time = datetime.fromisoformat(last_point["occurred_at"])
                same_camera = (ev["camera_id"] == last_point["camera_id"])
                time_diff = (ev_time - last_time).total_seconds()

                if same_camera and time_diff < window:
                    # Update with higher confidence read if applicable
                    if ev["ocr_confidence"] > last_point["confidence"]:
                        last_point["confidence"] = ev["ocr_confidence"]
                        last_point["evidence_ref"] = ev["evidence_ref"]
                        last_point["thumbnail_uri"] = (ev["evidence_ref"] or {}).get("thumbnail_uri")
                        last_point["clip_uri"] = (ev["evidence_ref"] or {}).get("clip_uri")
                    continue

            ev_ref = ev.get("evidence_ref") or {}
            point = {
                "sequence": len(deduped_points) + 1,
                "event_id": ev.get("event_id"),
                "camera_id": ev["camera_id"],
                "camera_name": ev["camera_name"],
                "camera_code": ev["camera_code"],
                "department_name": ev.get("department_name", ""),
                "latitude": ev["latitude"],
                "longitude": ev["longitude"],
                "location": {"lat": ev["latitude"], "lon": ev["longitude"]},
                "occurred_at": ev["occurred_at"],
                "confidence": ev["ocr_confidence"],
                "raw_plate": ev.get("raw_plate", plate),
                "normalized_plate": timeline_data["normalized_plate"],
                "evidence_ref": ev_ref,
                "thumbnail_uri": ev_ref.get("thumbnail_uri"),
                "clip_uri": ev_ref.get("clip_uri"),
            }
            deduped_points.append(point)
            last_point = point

        # Step 8 & 9: Identify explicit gaps where no camera observations exist
        gaps = []
        for i in range(len(deduped_points) - 1):
            p1 = deduped_points[i]
            p2 = deduped_points[i + 1]
            t1 = datetime.fromisoformat(p1["occurred_at"])
            t2 = datetime.fromisoformat(p2["occurred_at"])
            delta_seconds = (t2 - t1).total_seconds()

            if delta_seconds > self.gap_threshold_seconds:
                gaps.append({
                    "from_point_sequence": p1["sequence"],
                    "to_point_sequence": p2["sequence"],
                    "from_camera": p1["camera_name"],
                    "to_camera": p2["camera_name"],
                    "from_time": p1["occurred_at"],
                    "to_time": p2["occurred_at"],
                    "gap_seconds": round(delta_seconds, 1),
                    "reason": "UNOBSERVED_CORRIDOR_TRANSIT"
                })

        return {
            "plate": plate,
            "normalized_plate": timeline_data["normalized_plate"],
            "from_time": from_time.isoformat() if from_time else (deduped_points[0]["occurred_at"] if deduped_points else ""),
            "to_time": to_time.isoformat() if to_time else (deduped_points[-1]["occurred_at"] if deduped_points else ""),
            "total_sightings": len(deduped_points),
            "total_points": len(deduped_points),
            "unique_cameras": len(set(p["camera_id"] for p in deduped_points)),
            "points": deduped_points,
            "gaps": gaps
        }

    def get_evidence(
        self,
        plate: str,
        from_time: Optional[datetime],
        to_time: Optional[datetime],
        db: Session
    ) -> Dict[str, Any]:
        timeline_data = self.get_timeline(plate, from_time, to_time, db)
        evidence_list = []
        for ev in timeline_data["events"]:
            evidence_ref = ev.get("evidence_ref") or {}
            if evidence_ref:
                evidence_list.append({
                    "event_id": ev["event_id"],
                    "camera_id": ev["camera_id"],
                    "camera_name": ev["camera_name"],
                    "occurred_at": ev["occurred_at"],
                    "thumbnail_uri": evidence_ref.get("thumbnail_uri"),
                    "clip_uri": evidence_ref.get("clip_uri")
                })
        return {
            "plate": plate,
            "evidence_count": len(evidence_list),
            "evidence_records": evidence_list
        }

route_engine = RouteEngine()
