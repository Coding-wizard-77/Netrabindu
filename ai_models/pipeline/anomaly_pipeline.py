from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Any, Dict, List, Optional
import numpy as np

from ai_models.config import ai_config
from ai_models.models.anomaly import AnomalyResult, anomaly_engine
from ai_models.pipeline.evidence_saver import evidence_saver
from ai_models.publisher.event_publisher import event_publisher

logger = logging.getLogger("ai_models.anomaly_pipeline")


class AnomalyPipeline:
    """
    Continuous Multi-Stream Real-Time Anomaly Inspection Pipeline.
    Inspects video frames from active cameras, triggers CV/ML anomaly detectors,
    preserves forensic evidence images on disk, and emits standardized event payloads.
    """

    def __init__(self) -> None:
        self.evidence_saver = evidence_saver
        self.engine = anomaly_engine
        self.cooldown_map: Dict[str, float] = {}  # {(camera_id, anomaly_type): last_alert_time}

    def process_camera_frame(
        self,
        frame: np.ndarray,
        camera_id: str,
        camera_code: str,
        camera_name: str = "Gujarat Surveillance Node",
        lat: float = 23.0330,
        lon: float = 72.5120,
        tracked_objects: Optional[List[Dict[str, Any]]] = None,
        pts_ms: float = 0.0,
        corridor_heading_deg: float = 90.0
    ) -> List[Dict[str, Any]]:
        """
        Inspects camera frame for anomalies. If detected and outside cooldown window:
        1. Annotates and writes forensic evidence image with SHA-256 seal.
        2. Formats locked event contract conforming to contracts/event-contract.md.
        3. Returns generated anomaly event dictionaries.
        """
        if frame is None:
            return []

        anomalies: List[AnomalyResult] = self.engine.analyze_frame(
            frame=frame,
            camera_id=camera_id,
            camera_code=camera_code,
            tracked_objects=tracked_objects,
            pts_ms=pts_ms,
            corridor_heading_deg=corridor_heading_deg
        )

        now = time.time()
        emitted_events: List[Dict[str, Any]] = []

        for anomaly in anomalies:
            cooldown_key = f"{camera_id}_{anomaly.anomaly_type.value}"
            # 20-second alert cooldown per anomaly type per camera to prevent alert storming
            if now - self.cooldown_map.get(cooldown_key, 0.0) < 20.0:
                continue

            self.cooldown_map[cooldown_key] = now
            event_id = f"anom_{uuid.uuid4().hex[:12]}"

            # Save Annotated Evidence Image & SHA-256 seal
            evidence_data = self.evidence_saver.save_anomaly_evidence(
                frame=frame,
                event_id=event_id,
                camera_code=camera_code,
                camera_name=camera_name,
                anomaly_type=anomaly.anomaly_type.value,
                severity=anomaly.severity.value,
                confidence=anomaly.confidence,
                bbox=anomaly.bbox,
                pts_ms=pts_ms
            )

            # Assemble event payload conforming to event-contract.md
            event_payload = {
                "event_id": event_id,
                "event_type": "ANOMALY",
                "camera_id": camera_id,
                "camera_code": camera_code,
                "camera_name": camera_name,
                "occurred_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "confidence": anomaly.confidence,
                "identifier": {
                    "type": "traffic_anomaly",
                    "raw": anomaly.anomaly_type.value,
                    "normalized": anomaly.anomaly_type.value,
                    "confidence": anomaly.confidence,
                    "severity": anomaly.severity.value,
                    "description": anomaly.description,
                    "metrics": anomaly.metrics
                },
                "location": {
                    "lat": lat,
                    "lon": lon
                },
                "evidence": {
                    "thumbnail_uri": evidence_data["thumbnail_uri"],
                    "clip_uri": evidence_data["evidence_uri"],
                    "sha256": evidence_data["sha256"],
                    "certification": "SECTION_65B_IEA_COMPLIANT"
                },
                "pipeline": {
                    "node_id": ai_config.NODE_ID,
                    "model_version": "netrabindu-anomaly-v2",
                    "quality_state": "Critical" if anomaly.severity.value == "CRITICAL" else "Active",
                    "inference_tier": "EDGE_SENTINEL_ANOMALY_ENGINE",
                    "escalation_reason": anomaly.anomaly_type.value
                }
            }

            emitted_events.append(event_payload)
            logger.info(f"[ANOMALY TRIGGERED] {camera_code} -> {anomaly.anomaly_type.value} ({anomaly.severity.value})")

            # Asynchronously dispatch event to backend if event loop is running
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(event_publisher.publish_detection(event_payload))
            except RuntimeError:
                # No active event loop running synchronously
                pass
            except Exception as pub_err:
                logger.debug(f"Event dispatch error: {pub_err}")

        return emitted_events


anomaly_pipeline = AnomalyPipeline()
