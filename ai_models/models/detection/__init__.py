"""Detection models for Engineer 2."""

from .base import BaseDetector, DetectionBox, DetectionResult
from .yolo_like import YOLOLikeDetector

__all__ = ["BaseDetector", "DetectionBox", "DetectionResult", "YOLOLikeDetector"]
