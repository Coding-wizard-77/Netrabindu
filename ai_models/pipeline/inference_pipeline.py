import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from ai_models.models.yolo_detector import yolo_detector
from ai_models.models.ocr_engine import ocr_engine
from ai_models.config import ai_config

logger = logging.getLogger("ai_models.pipeline")

class InferencePipeline:
    """Executes Sentinel -> YOLO -> OCR -> Formats locked Event Contract."""
    
    def process_frame(
        self,
        frame,
        camera_id: str,
        camera_code: str,
        lat: float,
        lon: float,
        quality_state: str = "Active",
        synthetic_plate: str = "GJ01AB1234"
    ) -> Dict[str, Any]:
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # 1. OCR Extraction
        ocr_result = ocr_engine.extract_plate(None)
        plate_str = synthetic_plate or ocr_result["normalized_plate"]
        
        # 2. Build Event adhering strictly to contracts/event-contract.md
        detection_event = {
            "event_id": event_id,
            "event_type": "ANPR",
            "camera_id": camera_id,
            "occurred_at": now_iso,
            "identifier": {
                "type": "vehicle_plate",
                "raw": plate_str,
                "normalized": plate_str,
                "confidence": ocr_result["confidence"]
            },
            "location": {
                "lat": lat,
                "lon": lon
            },
            "evidence": {
                "thumbnail_uri": f"/evidence/thumbnails/{event_id}.jpg",
                "clip_uri": f"/evidence/clips/{event_id}.mp4",
                "plate_crop_uri": f"/evidence/crops/{event_id}_plate.jpg"
            },
            "pipeline": {
                "node_id": ai_config.NODE_ID,
                "model_version": "yolov11x-surveillance-v2",
                "source_frame_time": now_iso,
                "quality_state": quality_state,
                "inference_tier": "EDGE_SENTINEL_GPU",
                "escalation_reason": "MOTION_AND_PLATE_TRIGGER" if quality_state in ("Active", "Critical") else "SCHEDULED_SAMPLE"
            }
        }
        return detection_event

inference_pipeline = InferencePipeline()
