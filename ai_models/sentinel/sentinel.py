from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class SentinelResult:
    activity_score: float
    trigger: bool
    reason: str
    quality_hint: str


class ActivitySentinel:
    """Cheap always-on activity detector for edge state selection.

    This implementation intentionally uses lightweight, dependency-free heuristics
    so it can run without full model stacks while preserving the architecture
    required by the Engineer 2 contract.
    """

    def __init__(self, motion_threshold: float = 0.35, quiet_threshold: float = 0.2) -> None:
        self.motion_threshold = motion_threshold
        self.quiet_threshold = quiet_threshold

    def evaluate(self, *, motion_score: float, scene_entropy: float = 0.0, object_count: int = 0) -> SentinelResult:
        activity_score = min(1.0, max(0.0, motion_score * 0.7 + min(1.0, scene_entropy) * 0.2 + min(3, object_count) * 0.1))
        trigger = activity_score >= self.motion_threshold
        if activity_score <= self.quiet_threshold:
            reason = "quiet-scene"
            quality_hint = "Idle"
        elif activity_score < 0.6:
            reason = "moderate-activity"
            quality_hint = "Normal"
        elif activity_score < 0.85:
            reason = "target-present"
            quality_hint = "Active"
        else:
            reason = "high-value-uncertain-scene"
            quality_hint = "Critical"
        return SentinelResult(activity_score=activity_score, trigger=trigger, reason=reason, quality_hint=quality_hint)

    def from_frame_stats(self, frame_stats: Dict[str, Optional[float]]) -> SentinelResult:
        motion_score = float(frame_stats.get("motion_score") or 0.0)
        scene_entropy = float(frame_stats.get("scene_entropy") or 0.0)
        object_count = int(frame_stats.get("object_count") or 0)
        return self.evaluate(motion_score=motion_score, scene_entropy=scene_entropy, object_count=object_count)

    def evaluate_frame(self, frame: Any, prev_frame: Optional[Any] = None) -> SentinelResult:
        """Evaluates a live video frame (bytes or numpy ndarray) directly.
        Calculates real inter-frame motion, scene entropy, and foreground components.
        """
        if frame is None:
            return self.evaluate(motion_score=0.0, scene_entropy=0.0, object_count=0)

        try:
            import cv2
            import numpy as np

            # Decode bytes if needed
            if isinstance(frame, (bytes, bytearray)):
                arr = np.frombuffer(frame, dtype=np.uint8)
                img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            else:
                img = frame

            if img is None or not hasattr(img, "shape"):
                return self.evaluate(motion_score=0.0, scene_entropy=0.0, object_count=0)

            # Downsample for ultra-fast edge sentinel pass (<1ms)
            small = cv2.resize(img, (160, 90), interpolation=cv2.INTER_NEAREST)
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY) if len(small.shape) == 3 else small

            # 1. Motion score via inter-frame differencing
            motion_score = 0.0
            if prev_frame is not None:
                if isinstance(prev_frame, (bytes, bytearray)):
                    p_arr = np.frombuffer(prev_frame, dtype=np.uint8)
                    p_img = cv2.imdecode(p_arr, cv2.IMREAD_COLOR)
                else:
                    p_img = prev_frame

                if p_img is not None and hasattr(p_img, "shape"):
                    p_small = cv2.resize(p_img, (160, 90), interpolation=cv2.INTER_NEAREST)
                    p_gray = cv2.cvtColor(p_small, cv2.COLOR_BGR2GRAY) if len(p_small.shape) == 3 else p_small
                    diff = cv2.absdiff(gray, p_gray)
                    motion_score = min(1.0, max(0.0, float(np.mean(diff)) / 32.0))

            # 2. Scene Entropy (visual complexity / information density)
            hist = cv2.calcHist([gray], [0], None, [32], [0, 256])
            hist = hist.ravel() / (hist.sum() + 1e-7)
            non_zero = hist[hist > 0]
            entropy = -float(np.sum(non_zero * np.log2(non_zero)))
            scene_entropy = min(1.0, max(0.0, entropy / 5.0))

            # 3. Fast contour count for potential foreground objects
            _, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            meaningful_contours = [c for c in contours if cv2.contourArea(c) > 30]
            object_count = min(10, len(meaningful_contours))

            return self.evaluate(motion_score=motion_score, scene_entropy=scene_entropy, object_count=object_count)
        except Exception:
            return self.evaluate(motion_score=0.1, scene_entropy=0.1, object_count=0)

