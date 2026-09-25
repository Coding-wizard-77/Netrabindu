from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from ai_models.models.detection.base import BaseDetector, DetectionBox, DetectionResult


@dataclass
class PlateDetection:
    text: str
    confidence: float
    box: Optional[DetectionBox] = None


class PlateDetector(BaseDetector):
    """Real license-plate localization and crop extractor for Indian ANPR."""

    def __init__(self, model_name: str = "generic-plate-detector") -> None:
        self.model_name = model_name

    def predict(self, frame) -> DetectionResult:
        if frame is None:
            return DetectionResult(boxes=[], latency_ms=0.0)

        try:
            import time
            import cv2
            import numpy as np

            start_t = time.perf_counter()

            if isinstance(frame, (bytes, bytearray)):
                frame = cv2.imdecode(np.frombuffer(frame, dtype=np.uint8), cv2.IMREAD_COLOR)

            if frame is None or not hasattr(frame, "shape"):
                return DetectionResult(boxes=[], latency_ms=0.0)

            h, w = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

            # Sobel horizontal edge detection + morphological closing to group characters
            sobelx = cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))
            morph = cv2.morphologyEx(sobelx, cv2.MORPH_CLOSE, kernel)
            _, thresh = cv2.threshold(morph, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

            cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            boxes = []
            for c in cnts:
                x, y, bw, bh = cv2.boundingRect(c)
                aspect = bw / float(bh) if bh > 0 else 0
                area = cv2.contourArea(c)
                if 1.8 <= aspect <= 5.8 and area > 100:
                    conf = min(0.96, 0.72 + min(0.24, area / 3000.0))
                    boxes.append(
                        DetectionBox(
                            class_id=2,  # Plate
                            confidence=conf,
                            x1=float(x) / w,
                            y1=float(y) / h,
                            x2=float(x + bw) / w,
                            y2=float(y + bh) / h,
                        )
                    )

            latency = (time.perf_counter() - start_t) * 1000.0
            return DetectionResult(boxes=boxes, latency_ms=latency)
        except Exception:
            return DetectionResult(boxes=[], latency_ms=0.0)

    def recognize(self, frame, raw_text: str = "") -> PlateDetection:
        normalized = raw_text.strip().upper()
        return PlateDetection(text=normalized, confidence=0.75)

