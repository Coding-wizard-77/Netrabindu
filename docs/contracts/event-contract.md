# Netrabindu Event Contract — Version 1.0.0 (LOCKED)

This document represents the immutable Event Bus specification between Engineer 1 (Platform & Event Core), Engineer 2 (Edge AI Producer), and Engineer 3 (Consumer via WS).

## Topic Topology

| Topic | Producer | Consumer | Key | Retention |
| :--- | :--- | :--- | :--- | :--- |
| `camera.health` | E1 Health Monitor | E1 / E3 Dashboard | `camera_id` | 7 days |
| `anpr.events` | E2 Analytics | E1 Persistence, Watchlist, Route Engine | `camera_id` or `normalized_plate` | 30 days |
| `vehicle.events` | E2 Analytics / Tracker | E1 Correlation Engine | `camera_id` | 30 days |
| `watchlist.matches` | E1 Correlation Engine | E1 Alert Service, Audit | `entity_id` | 90 days |
| `alerts` | E1 Alert Service | WebSocket Gateway, Audit | `alert_id` | 90 days |
| `adaptive.telemetry` | E2 Adaptive Controller | E1 Metrics & Dashboard | `camera_id` | 7 days |

---

## 1. ANPR Detection Event Contract (`anpr.events`)
Produced by Engineer 2; consumed and persisted idempotently by Engineer 1.

```json
{
  "event_id": "evt_01J67890ABCDEF1234567890AB",
  "event_type": "ANPR",
  "camera_id": "c7a8b9c0-1234-5678-9abc-def012345678",
  "occurred_at": "2026-09-03T12:00:00.123Z",
  "identifier": {
    "type": "vehicle_plate",
    "raw": "GJ 01 AB 1234",
    "normalized": "GJ01AB1234",
    "confidence": 0.942
  },
  "location": {
    "lat": 23.0225,
    "lon": 72.5714
  },
  "evidence": {
    "thumbnail_uri": "s3://evidence/2026/09/03/cam_01/evt_01J67890.jpg",
    "clip_uri": "s3://evidence/2026/09/03/cam_01/evt_01J67890.mp4",
    "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "pipeline": {
    "node_id": "edge-node-ahm-01",
    "model_version": "yolov8x-plate-v2.1",
    "ocr_engine": "tesseract-crnn-v1",
    "source_frame_time": "2026-09-03T12:00:00.080Z"
  }
}
```

---

## 2. Camera Health Event Contract (`camera.health`)
```json
{
  "camera_id": "c7a8b9c0-1234-5678-9abc-def012345678",
  "timestamp": "2026-09-03T12:00:00.000Z",
  "state": "ONLINE",
  "latency_ms": 42.5,
  "fps": 25.0,
  "bitrate_kbps": 4096.0,
  "codec": "h264",
  "reason": null
}
```

---

## 3. Watchlist Match Event Contract (`watchlist.matches`)
```json
{
  "match_id": "mat_01J6789...",
  "event_id": "evt_01J67890ABCDEF1234567890AB",
  "entity_id": "wle_1234-5678...",
  "matched_identifier": "GJ01AB1234",
  "watchlist_category": "STOLEN_VEHICLE",
  "priority": "CRITICAL",
  "match_type": "EXACT",
  "similarity_score": 1.0,
  "timestamp": "2026-09-03T12:00:00.150Z"
}
```

---

## 4. Alert Event Contract (`alerts`)
```json
{
  "alert_id": "alt_01J6789...",
  "event_id": "evt_01J67890ABCDEF1234567890AB",
  "entity_id": "wle_1234-5678...",
  "severity": "CRITICAL",
  "state": "NEW",
  "title": "Stolen Vehicle Detected: GJ01AB1234",
  "camera_id": "c7a8b9c0-1234-5678-9abc-def012345678",
  "camera_name": "Ahmedabad Junction Entry Cam 1",
  "coordinates": [23.0225, 72.5714],
  "occurred_at": "2026-09-03T12:00:00.123Z",
  "created_at": "2026-09-03T12:00:00.180Z"
}
```

---

## 5. Adaptive Telemetry Event (`adaptive.telemetry`)
```json
{
  "camera_id": "c7a8b9c0-1234-5678-9abc-def012345678",
  "timestamp": "2026-09-03T12:00:00.000Z",
  "quality_state": "ACTIVE",
  "fps": 15.0,
  "resolution": "1080p",
  "bitrate_kbps": 2048.0,
  "inference_tier": "CASCADED_TASK",
  "motion_activity_score": 0.85,
  "switch_reason": "ROI_ESCALATION"
}
```
