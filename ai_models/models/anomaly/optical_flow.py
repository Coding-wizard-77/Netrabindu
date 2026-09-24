from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple
import cv2
import numpy as np

from .base import AnomalyResult, AnomalySeverity, AnomalyType, BaseAnomalyDetector


class OpticalFlowMotionEstimator(BaseAnomalyDetector):
    """
    Dense Gunnar Farneback Optical Flow Motion Vector Estimator.
    Calculates velocity magnitude and angular direction of objects in the scene.
    Detects sudden abnormal directional surges and counter-flow dynamics.
    """

    def __init__(self, name: str = "dense-optical-flow") -> None:
        super().__init__(name)
        self.prev_gray: Optional[np.ndarray] = None

    def estimate_flow(self, frame: np.ndarray) -> Dict[str, Any]:
        if frame is None:
            return {"mean_magnitude": 0.0, "dominant_angle": 0.0, "has_motion": False}

        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame

        # Downsample for ultra-fast edge processing (160x90)
        h, w = gray.shape[:2]
        small = cv2.resize(gray, (160, 90), interpolation=cv2.INTER_LINEAR)

        if self.prev_gray is None:
            self.prev_gray = small
            return {"mean_magnitude": 0.0, "dominant_angle": 0.0, "has_motion": False}

        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray,
            small,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0
        )
        self.prev_gray = small

        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1], angleInDegrees=True)
        mean_mag = float(np.mean(mag))
        active_mask = mag > 1.5
        dominant_angle = float(np.median(ang[active_mask])) if np.any(active_mask) else 0.0

        return {
            "mean_magnitude": mean_mag,
            "dominant_angle": dominant_angle,
            "has_motion": mean_mag > 0.4
        }
