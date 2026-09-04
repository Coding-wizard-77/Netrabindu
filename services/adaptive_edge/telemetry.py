from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class AdaptiveTelemetry:
    adaptive_quality_state: str = "Idle"
    quality_switch_count: int = 0
    sentinel_trigger_rate: float = 0.0
    inference_escalation_latency_ms: float = 0.0
    avg_bandwidth_per_camera: float = 0.0
    inference_compute_per_camera_hour: float = 0.0
    quality_state_dwell_time: float = 0.0
    detection_quality_by_state: Dict[str, float] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, object]:
        return {
            "adaptive_quality_state": self.adaptive_quality_state,
            "quality_switch_count": self.quality_switch_count,
            "sentinel_trigger_rate": self.sentinel_trigger_rate,
            "inference_escalation_latency_ms": self.inference_escalation_latency_ms,
            "avg_bandwidth_per_camera": self.avg_bandwidth_per_camera,
            "inference_compute_per_camera_hour": self.inference_compute_per_camera_hour,
            "quality_state_dwell_time": self.quality_state_dwell_time,
            "detection_quality_by_state": self.detection_quality_by_state,
        }


class TelemetryRecorder:
    def __init__(self) -> None:
        self.metrics: Dict[str, AdaptiveTelemetry] = {}

    def get_or_create(self, camera_id: str) -> AdaptiveTelemetry:
        if camera_id not in self.metrics:
            self.metrics[camera_id] = AdaptiveTelemetry()
        return self.metrics[camera_id]

    def update_state(self, camera_id: str, state: str) -> AdaptiveTelemetry:
        metric = self.get_or_create(camera_id)
        metric.adaptive_quality_state = state
        return metric
