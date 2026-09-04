from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from time import time
from typing import Dict, Optional


class QualityState(str, Enum):
    IDLE = "Idle"
    NORMAL = "Normal"
    ACTIVE = "Active"
    CRITICAL = "Critical"


@dataclass
class CameraQualityState:
    current: QualityState = QualityState.IDLE
    last_activity: float = field(default_factory=time)
    quality_switch_count: int = 0
    dwell_time: float = 0.0
    cooldown_until: float = 0.0
    escalation_reason: str = ""


class AdaptiveController:
    def __init__(self, cooldown_seconds: float = 5.0, quiet_threshold: float = 0.3):
        self.cooldown_seconds = cooldown_seconds
        self.quiet_threshold = quiet_threshold
        self._camera_state: Dict[str, CameraQualityState] = {}

    def _ensure_camera(self, camera_id: str) -> CameraQualityState:
        if camera_id not in self._camera_state:
            self._camera_state[camera_id] = CameraQualityState()
        return self._camera_state[camera_id]

    def current_state(self, camera_id: str) -> QualityState:
        return self._ensure_camera(camera_id).current

    def _candidate_state(self, score: float, watchlist: bool = False, uncertainty: float = 0.0) -> QualityState:
        if score <= self.quiet_threshold:
            return QualityState.IDLE
        if watchlist or uncertainty >= 0.8 or score >= 0.95:
            return QualityState.CRITICAL
        if score >= 0.7 or uncertainty >= 0.55:
            return QualityState.ACTIVE
        if score >= 0.35:
            return QualityState.NORMAL
        return QualityState.IDLE

    @staticmethod
    def _priority(state: QualityState) -> int:
        return {
            QualityState.IDLE: 0,
            QualityState.NORMAL: 1,
            QualityState.ACTIVE: 2,
            QualityState.CRITICAL: 3,
        }[state]

    def on_activity(
        self,
        camera_id: str,
        score: float,
        watchlist: bool = False,
        uncertainty: float = 0.0,
    ) -> QualityState:
        state = self._ensure_camera(camera_id)
        now = time()
        state.last_activity = now

        if score <= self.quiet_threshold:
            state.current = QualityState.IDLE
            state.escalation_reason = "quiet-scene"
            state.cooldown_until = now
            return state.current

        candidate = self._candidate_state(score=score, watchlist=watchlist, uncertainty=uncertainty)
        current_priority = self._priority(state.current)
        candidate_priority = self._priority(candidate)

        if candidate_priority > current_priority:
            state.current = candidate
            state.quality_switch_count += 1
            state.cooldown_until = now + self.cooldown_seconds
            if candidate == QualityState.CRITICAL:
                state.escalation_reason = "watchlist" if watchlist else "high-uncertainty"
            elif candidate == QualityState.ACTIVE:
                state.escalation_reason = "uncertainty-driven" if uncertainty >= 0.55 else "activity-escalation"
            else:
                state.escalation_reason = "moderate-activity"
            return state.current

        if state.cooldown_until > now and candidate_priority <= current_priority:
            state.escalation_reason = "cooldown-protected"
            return state.current

        state.current = candidate
        state.quality_switch_count += 1
        state.cooldown_until = now + self.cooldown_seconds
        if candidate == QualityState.CRITICAL:
            state.escalation_reason = "watchlist" if watchlist else "high-uncertainty"
        elif candidate == QualityState.ACTIVE:
            state.escalation_reason = "uncertainty-driven" if uncertainty >= 0.55 else "activity-escalation"
        elif candidate == QualityState.NORMAL:
            state.escalation_reason = "moderate-activity"
        else:
            state.escalation_reason = "quiet-scene"
        return state.current
