from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
import numpy as np

from .base import AnomalyResult, AnomalySeverity, AnomalyType, BaseAnomalyDetector
from .occlusion_detector import CameraOcclusionTamperDetector
from .optical_flow import OpticalFlowMotionEstimator
from .traffic_rules import TrafficRuleAnomalyDetector

logger = logging.getLogger("ai_models.anomaly")


class AnomalyEngine:
    """
    Unified Ensemble Anomaly Detection Engine.
    Coordinates optical flow, occlusion analysis, and semantic traffic rules.
    """

    def __init__(self) -> None:
        self.occlusion_detector = CameraOcclusionTamperDetector()
        self.optical_flow = OpticalFlowMotionEstimator()
        self.traffic_rules = TrafficRuleAnomalyDetector()

    def analyze_frame(
        self,
        frame: np.ndarray,
        camera_id: str,
        camera_code: str,
        tracked_objects: Optional[List[Dict[str, Any]]] = None,
        pts_ms: float = 0.0,
        corridor_heading_deg: float = 90.0
    ) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []

        # 1. Optical Occlusion & Tamper Analysis
        try:
            tamper_anomalies = self.occlusion_detector.inspect(
                frame=frame,
                camera_id=camera_id,
                camera_code=camera_code,
                pts_ms=pts_ms
            )
            anomalies.extend(tamper_anomalies)
        except Exception as e:
            logger.warning(f"Occlusion inspection error: {e}")

        # 2. Optical Flow Motion Dynamics
        try:
            flow_info = self.optical_flow.estimate_flow(frame)
        except Exception as e:
            flow_info = {}

        # 3. Traffic Rules & Centroid Trajectory Anomalies
        if tracked_objects:
            try:
                rule_anomalies = self.traffic_rules.inspect_detections(
                    tracked_objects=tracked_objects,
                    camera_id=camera_id,
                    camera_code=camera_code,
                    pts_ms=pts_ms,
                    calibrated_heading_deg=corridor_heading_deg
                )
                anomalies.extend(rule_anomalies)
            except Exception as e:
                logger.warning(f"Traffic rule inspection error: {e}")

        return anomalies


anomaly_engine = AnomalyEngine()
