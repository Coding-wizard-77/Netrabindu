from __future__ import annotations

from typing import Any, Dict, List, Optional

from services.adaptive_edge.engine import AdaptiveController
from services.adaptive_edge.sentinel import ActivitySentinel


class AdaptivePipeline:
    """Production-safe orchestration layer for E2 edge intelligence.

    This is the pipeline wrapper that combines the sentinel and the adaptive
    quality controller into a single evaluative step. It gives a consistent
    contract for downstream tasks and remains isolated to Engineer 2-owned code.
    """

    def __init__(
        self,
        controller: Optional[AdaptiveController] = None,
        sentinel: Optional[ActivitySentinel] = None,
    ) -> None:
        self.controller = controller or AdaptiveController()
        self.sentinel = sentinel or ActivitySentinel()

    def evaluate(
        self,
        *,
        camera_id: str,
        motion_score: float,
        scene_entropy: float = 0.0,
        object_count: int = 0,
        watchlist: bool = False,
        uncertainty: float = 0.0,
    ) -> Dict[str, Any]:
        result = self.sentinel.evaluate(
            motion_score=motion_score,
            scene_entropy=scene_entropy,
            object_count=object_count,
        )
        quality_state = self.controller.on_activity(
            camera_id,
            score=result.activity_score,
            watchlist=watchlist,
            uncertainty=uncertainty,
        )

        tier = {
            "Idle": "economical",
            "Normal": "balanced",
            "Active": "high",
            "Critical": "critical",
        }.get(quality_state.value if hasattr(quality_state, "value") else str(quality_state), "economical")

        reasons: List[str] = []
        if result.reason:
            reasons.append(result.reason)
        if watchlist:
            reasons.append("watchlist")
        if uncertainty >= 0.6:
            reasons.append("uncertainty-driven")
        if not reasons:
            reasons.append("steady-scene")

        return {
            "camera_id": camera_id,
            "quality_state": quality_state.value if hasattr(quality_state, "value") else str(quality_state),
            "sentinel": {
                "trigger": result.trigger,
                "activity_score": result.activity_score,
                "reason": result.reason,
                "quality_hint": result.quality_hint,
            },
            "inference_tier": tier,
            "reasons": reasons,
        }
