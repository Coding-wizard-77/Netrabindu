# Event Contract

## Engineer 2 -> Engineer 1 locked event contract

```json
{
  "event_id": "evt_...",
  "event_type": "ANPR|PERSON_REID|VEHICLE|OBJECT",
  "camera_id": "cam_...",
  "occurred_at": "UTC timestamp",
  "identifier": {
    "type": "vehicle_plate|person_candidate|vehicle_track|object",
    "raw": "...",
    "normalized": "...",
    "confidence": 0.94
  },
  "location": {
    "lat": 23.0225,
    "lon": 72.5714
  },
  "evidence": {
    "thumbnail_uri": "s3://...",
    "clip_uri": "s3://..."
  },
  "pipeline": {
    "node_id": "edge-...",
    "model_version": "...",
    "source_frame_time": "...",
    "quality_state": "Idle|Normal|Active|Critical",
    "inference_tier": "...",
    "escalation_reason": "..."
  }
}
```

Notes:
- E2 emits normalized events only.
- E2 does not persist directly to E1-owned databases.
- Evidence URIs must be valid if present, otherwise explicitly unavailable.
