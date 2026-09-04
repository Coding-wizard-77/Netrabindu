from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from models.detection.base import BaseDetector, DetectionBox, DetectionResult


@dataclass
class PlateDetection:
    text: str
    confidence: float
    box: Optional[DetectionBox] = None


class PlateDetector(BaseDetector):
    """Placeholder for a dedicated license-plate detection model."""

    def __init__(self, model_name: str = "generic-plate-detector") -> None:
        self.model_name = model_name

    def predict(self, frame):
        return DetectionResult(boxes=[], latency_ms=0.0)

    def recognize(self, frame, raw_text: str = "") -> PlateDetection:
        normalized = raw_text.strip().upper()
        return PlateDetection(text=normalized, confidence=0.75)
