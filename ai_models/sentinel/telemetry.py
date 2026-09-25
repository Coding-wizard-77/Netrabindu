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
        self._sentinel_samples: Dict[str, List[int]] = {}

    def get_or_create(self, camera_id: str) -> AdaptiveTelemetry:
        if camera_id not in self.metrics:
            self.metrics[camera_id] = AdaptiveTelemetry()
            self._sentinel_samples[camera_id] = []
        return self.metrics[camera_id]

    def update_state(self, camera_id: str, state: str) -> AdaptiveTelemetry:
        metric = self.get_or_create(camera_id)
        if metric.adaptive_quality_state != state:
            metric.quality_switch_count += 1
        metric.adaptive_quality_state = state
        return metric

    def record_switch(self, camera_id: str, state: str, dwell_time_sec: float = 0.0) -> AdaptiveTelemetry:
        metric = self.get_or_create(camera_id)
        if metric.adaptive_quality_state != state:
            metric.quality_switch_count += 1
        metric.adaptive_quality_state = state
        metric.quality_state_dwell_time = dwell_time_sec
        return metric

    def record_sentinel(self, camera_id: str, triggered: bool) -> float:
        metric = self.get_or_create(camera_id)
        samples = self._sentinel_samples[camera_id]
        samples.append(1 if triggered else 0)
        if len(samples) > 100:
            samples.pop(0)
        rate = sum(samples) / float(len(samples))
        metric.sentinel_trigger_rate = round(rate, 4)
        return rate

    def record_escalation(self, camera_id: str, latency_ms: float) -> None:
        metric = self.get_or_create(camera_id)
        metric.inference_escalation_latency_ms = round(latency_ms, 2)

    def record_efficiency(self, camera_id: str, bandwidth_mbps: float, compute_hours: float) -> None:
        metric = self.get_or_create(camera_id)
        metric.avg_bandwidth_per_camera = round(bandwidth_mbps, 2)
        metric.inference_compute_per_camera_hour = round(compute_hours, 4)

    def record_quality(self, camera_id: str, state: str, score: float) -> None:
        metric = self.get_or_create(camera_id)
        metric.detection_quality_by_state[state] = round(score, 3)

    def snapshot(self, camera_id: str) -> Dict[str, object]:
        return self.get_or_create(camera_id).as_dict()

