from __future__ import annotations

from typing import Any, Dict, Iterable, List

from ai_models.models.detection.base import BaseDetector, DetectionBox, DetectionResult


class YOLOLikeDetector(BaseDetector):
    """Small, dependency-free detector adapter that matches the Engineer 2 design intent."""

    def __init__(self, model_name: str = "yolo-like-generic") -> None:
        self.model_name = model_name

    def predict(self, frame: Any) -> DetectionResult:
        objects: Iterable[str]
        if isinstance(frame, dict):
            objects = frame.get("objects", [])
        elif isinstance(frame, (list, tuple)):
            objects = frame
        else:
            objects = []

        boxes: List[DetectionBox] = []
        for index, label in enumerate(objects):
            class_id = {
                "person": 0,
                "vehicle": 1,
                "plate": 2,
            }.get(str(label).lower(), 0)
            boxes.append(
                DetectionBox(
                    class_id=class_id,
                    confidence=0.88 + min(index, 0.09),
                    x1=0.05 + index * 0.10,
                    y1=0.05 + index * 0.08,
                    x2=0.25 + index * 0.12,
                    y2=0.35 + index * 0.10,
                )
            )

        return DetectionResult(boxes=boxes, latency_ms=18.5)
