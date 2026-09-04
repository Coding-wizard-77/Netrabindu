"""AI model package for Engineer 2."""

from .detection.base import BaseDetector, DetectionBox, DetectionResult
from .detection.yolo_like import YOLOLikeDetector
from .ocr.paddle_ocr import OCRResult, PaddleOCRAdapter
from .plate.detector import PlateDetection, PlateDetector
from .reid.embedding import LightweightReIDAdapter
from .tracking.bytetrack import ByteTrackTracker, Track

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
