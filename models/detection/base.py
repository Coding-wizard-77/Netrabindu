from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Tuple


@dataclass
class DetectionBox:
    class_id: int
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float


@dataclass
class DetectionResult:
    boxes: List[DetectionBox] = field(default_factory=list)
    latency_ms: float = 0.0


class BaseDetector:
    """Abstract detector contract used by the Engineer 2 analytics pipeline."""

    def predict(self, frame):
        raise NotImplementedError("Subclasses must implement predict().")

    def detect_objects(self, frame) -> List[Tuple[int, float, float, float, float, float]]:
        result = self.predict(frame)
        if hasattr(result, "boxes"):
            return [(d.class_id, d.confidence, d.x1, d.y1, d.x2, d.y2) for d in result.boxes]
        return []
