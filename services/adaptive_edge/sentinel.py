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
