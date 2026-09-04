# Netrabindu API Contract — Version 1.0.0 (LOCKED)

This document represents the immutable REST and WebSocket API contract between Engineer 1 (Platform & Backend), Engineer 2 (Edge AI), and Engineer 3 (Frontend Command Center).

## Authentication & Headers
All protected endpoints require HTTP Bearer token:
```
Authorization: Bearer <jwt_access_token>
```
All timestamps are returned in UTC (ISO 8601 string, e.g., `2026-09-03T12:00:00.123Z`). Frontend converts to IST (`Asia/Kolkata`).

---

## REST Endpoints

### 1. Auth & Administration
- `POST /api/auth/login`
  - Body: `{"username": "string", "password": "string"}`
  - Response: `{"access_token": "string", "token_type": "bearer", "user": {"id": "uuid", "username": "string", "role": "string", "department_id": "uuid"}}`
- `POST /api/auth/setup`
  - First-run admin initialization. Checks if admin exists.
  - Body: `{"username": "string", "password": "string", "email": "string", "department_code": "string"}`
  - Response: `{"status": "initialized", "user": {...}}`
- `GET /api/departments`
  - Response: `[{"id": "uuid", "code": "string", "name": "string", "jurisdiction": "string", "status": "ACTIVE"}]`

### 2. Camera Management & Onboarding
- `POST /api/cameras/import`
  - Multipart CSV or JSON batch import.
  - Returns: `{"imported_count": int, "cameras": [...], "errors": [...]}`
- `POST /api/cameras/discover/onvif`
  - Body: `{"interface_or_subnet": "string", "timeout_seconds": int}`
  - Response: `{"discovered_devices": [{"device_id": "string", "ip": "string", "manufacturer": "string", "model": "string", "profiles": [...]}]}`
- `POST /api/cameras`
  - Body: `{"camera_code": "string", "name": "string", "department_id": "uuid", "latitude": float, "longitude": float, "vendor": "string", "model": "string", "source_type": "DIRECT_RTSP|ONVIF|VMS", "protocol": "RTSP|ONVIF|SDK", "endpoint": "string", "username": "string", "password": "string", "retention_days": int, "analytics_profile": "ANPR|VEHICLE|PERSON|NONE"}`
  - Response: Camera details object.
- `GET /api/cameras`
  - Query: `?department_id=uuid&status=ONLINE&search=string&skip=0&limit=50`
  - Response: `[{"id": "uuid", "camera_code": "string", "name": "string", "latitude": float, "longitude": float, "status": "ONLINE|OFFLINE|DEGRADED|UNKNOWN|TESTING", ...}]`
- `GET /api/cameras/{id}`
  - Response: Detailed camera record with endpoints, health, adaptive profile, capabilities.
- `POST /api/cameras/{id}/validate`
  - Triggers ffprobe/stream validation.
  - Response: `{"valid": bool, "latency_ms": float, "codec": "string", "resolution": "string", "fps": float, "bitrate_kbps": float, "error_reason": string|null}`
- `POST /api/cameras/{id}/start`
  - Starts edge ingestion relay. Response: `{"status": "INGESTING", "path": "string"}`
- `POST /api/cameras/{id}/stop`
  - Stops edge ingestion relay. Response: `{"status": "STOPPED"}`
- `GET /api/cameras/{id}/stream`
  - Returns authorized browser stream sessions:
  - Response: `{"camera_id": "uuid", "webrtc_url": "string", "hls_url": "string", "rtsp_url": "string", "session_token": "string", "expires_at": "string"}`

### 3. Events & Intelligence
- `GET /api/events`
  - Query: `?camera_id=uuid&event_type=ANPR&from=iso_date&to=iso_date&skip=0&limit=100`
  - Response: `[DetectionEvent, ...]`
- `POST /api/events`
  - Ingestion endpoint for E2 workers when HTTP fallback is used.
  - Body: `DetectionEvent` JSON.
- `GET /api/vehicles/{plate}/timeline`
  - Query: `?from=iso_date&to=iso_date`
  - Response: `{"plate": "string", "normalized_plate": "string", "total_observations": int, "events": [...]}`
- `GET /api/vehicles/{plate}/route`
  - Query: `?from=iso_date&to=iso_date&window_seconds=30`
  - Response: `{"plate": "string", "normalized_plate": "string", "points": [{"sequence": int, "camera_id": "uuid", "camera_name": "string", "latitude": float, "longitude": float, "occurred_at": "string", "confidence": float, "evidence_ref": {...}}], "gaps": [{"from_time": "string", "to_time": "string", "gap_seconds": float, "reason": "UNOBSERVED_CORRIDOR"}]}`
- `GET /api/vehicles/{plate}/evidence`
  - Response: `{"plate": "string", "evidence_records": [{"event_id": "string", "camera_id": "uuid", "occurred_at": "string", "thumbnail_url": "string", "clip_url": "string"}]}`

### 4. Watchlists & Alerts
- `GET /api/watchlists`
  - Query: `?entity_type=VEHICLE|PERSON&category=STOLEN|WANTED|SUSPECT&status=ACTIVE`
  - Response: `[WatchlistEntity, ...]`
- `POST /api/watchlists`
  - Body: `{"entity_type": "VEHICLE|PERSON", "identifier": "string", "category": "string", "priority": "HIGH|MEDIUM|LOW", "source_ref": "string", "notes": "string"}`
- `POST /api/watchlists/match`
  - Diagnostic candidate matching for authorized operators.
  - Body: `{"identifier": "string"}`
  - Response: `{"candidates": [{"entity_id": "uuid", "identifier": "string", "similarity": float, "match_type": "EXACT|FUZZY"}]}`
- `GET /api/alerts`
  - Query: `?state=NEW|ACKNOWLEDGED|DISPATCHED|RESOLVED&severity=CRITICAL|HIGH|MEDIUM|LOW`
  - Response: `[Alert, ...]`
- `POST /api/alerts/{id}/acknowledge`
  - Body: `{"notes": "string"}`
- `POST /api/alerts/{id}/dispatch`
  - Body: `{"dispatch_unit": "string", "instructions": "string"}`
- `POST /api/alerts/{id}/resolve`
  - Body: `{"resolution": "RESOLVED|FALSE_POSITIVE", "notes": "string"}`

### 5. Health, Metrics & Audit
- `GET /api/health`
  - Response: `{"status": "READY|DEGRADED|UNHEALTHY", "components": {"database": "UP", "redis": "UP", "kafka": "UP", "mediamtx": "UP", "storage": "UP"}}`
- `GET /api/metrics`
  - Prometheus metrics export and summary JSON.
- `GET /api/audit`
  - Query: `?actor=string&action=string&from=iso_date&to=iso_date&skip=0&limit=100`
  - Response: `[AuditLog, ...]`

---

## WebSocket API: Live Alerts
- Endpoint: `ws://<host>/ws/alerts?token=<jwt_access_token>`
- Server broadcasts JSON on every new alert or alert status update:
```json
{
  "type": "ALERT_NEW",
  "data": {
    "id": "uuid",
    "event_id": "evt_...",
    "severity": "CRITICAL",
    "state": "NEW",
    "entity_identifier": "GJ01AB1234",
    "camera_id": "uuid",
    "camera_name": "Ahmedabad Junction",
    "location": {"lat": 23.0225, "lon": 72.5714},
    "occurred_at": "2026-09-03T12:00:00.123Z",
    "evidence": {
      "thumbnail_url": "...",
      "clip_url": "..."
    }
  }
}
```
