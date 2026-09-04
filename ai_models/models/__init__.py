"""AI model package for Engineer 2."""

from .detection.base import BaseDetector, DetectionBox, DetectionResult
from .ocr.paddle_ocr import OCRResult, PaddleOCRAdapter
from .plate.detector import PlateDetection, PlateDetector
from .tracking.bytetrack import ByteTrackTracker, Track

__all__ = [
    "BaseDetector",
    "DetectionBox",
    "DetectionResult",
    "OCRResult",
    "PaddleOCRAdapter",
    "PlateDetection",
    "PlateDetector",
    "ByteTrackTracker",
    "Track",
]
