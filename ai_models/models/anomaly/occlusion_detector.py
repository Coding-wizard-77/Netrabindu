from __future__ import annotations

from typing import Any, Dict, List, Optional
import cv2
import numpy as np

from .base import AnomalyResult, AnomalySeverity, AnomalyType, BaseAnomalyDetector


class CameraOcclusionTamperDetector(BaseAnomalyDetector):
    """
    Detects camera tampering, blackouts, flashlight blinding, and severe optical occlusion.
    Uses Laplacian variance (defocus/spray paint) and histogram luminance entropy.
    """

    def __init__(
        self,
        name: str = "occlusion-tamper-detector",
        blur_threshold: float = 12.0,
        dark_threshold: float = 18.0,
        bright_threshold: float = 245.0
    ) -> None:
        super().__init__(name)
        self.blur_threshold = blur_threshold
        self.dark_threshold = dark_threshold
        self.bright_threshold = bright_threshold

    def inspect(
        self,
        frame: Any,
        camera_id: str = "cam_unknown",
        camera_code: str = "CAM-01",
        pts_ms: float = 0.0,
        **kwargs
    ) -> List[AnomalyResult]:
        if frame is None or not isinstance(frame, np.ndarray):
            return []

        results: List[AnomalyResult] = []
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame

        # Compute focus measure (Laplacian variance)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        mean_brightness = float(np.mean(gray))

        # Check blinding or blackout
        is_blackout = mean_brightness < self.dark_threshold
        is_blinded = mean_brightness > self.bright_threshold
        is_heavily_blurred = lap_var < self.blur_threshold and not is_blackout

        if is_blackout or is_blinded or is_heavily_blurred:
            reason = "Camera Feed Blackout/Loss" if is_blackout else (
                "Camera Sensor Blinding/Glare Attack" if is_blinded else "Severe Lens Occlusion / Defocus Blur"
            )
            results.append(
                AnomalyResult(
                    anomaly_type=AnomalyType.CAMERA_OCCLUSION_TAMPER,
                    severity=AnomalySeverity.HIGH,
                    confidence=0.92,
                    description=f"{reason} detected on {camera_code} (Brightness: {mean_brightness:.1f}, Sharpness: {lap_var:.1f})",
                    camera_id=camera_id,
                    camera_code=camera_code,
                    bbox=(0.0, 0.0, 1.0, 1.0),
                    metrics={
                        "laplacian_variance": lap_var,
                        "mean_brightness": mean_brightness,
                        "condition": "BLACKOUT" if is_blackout else ("BLINDED" if is_blinded else "BLURRED")
                    },
                    frame_timestamp_ms=pts_ms
                )
            )

        return results
