"""Compatibility package for Engine 2 model imports."""

from ai_models.models.detection.base import BaseDetector, DetectionBox, DetectionResult
from ai_models.models.detection.yolo_like import YOLOLikeDetector
from ai_models.models.ocr.paddle_ocr import OCRResult, PaddleOCRAdapter
from ai_models.models.plate.detector import PlateDetection, PlateDetector
from ai_models.models.reid.embedding import LightweightReIDAdapter
from ai_models.models.tracking.bytetrack import ByteTrackTracker, Track

__all__ = [
    "BaseDetector",
    "DetectionBox",
    "DetectionResult",
    "YOLOLikeDetector",
    "OCRResult",
    "PaddleOCRAdapter",
    "PlateDetection",
    "PlateDetector",
    "LightweightReIDAdapter",
    "ByteTrackTracker",
    "Track",
]
