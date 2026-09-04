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
            return state.current

        if watchlist or uncertainty >= 0.7 or score >= 0.95:
            state.current = QualityState.CRITICAL
        elif score >= 0.7:
            state.current = QualityState.ACTIVE
        elif score >= 0.35:
            state.current = QualityState.NORMAL
        else:
            state.current = QualityState.IDLE

        state.quality_switch_count += 1 if state.current != self.current_state(camera_id) else 0
        return state.current
