from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class AnomalyType(str, Enum):
    WRONG_WAY_DRIVING = "WRONG_WAY_DRIVING"
    EXPRESSWAY_PEDESTRIAN = "EXPRESSWAY_PEDESTRIAN"
    ILLEGAL_STOPPING_HAZARD = "ILLEGAL_STOPPING_HAZARD"
    SUDDEN_CONGESTION_SURGE = "SUDDEN_CONGESTION_SURGE"
    CAMERA_OCCLUSION_TAMPER = "CAMERA_OCCLUSION_TAMPER"
    OVERSPEEDING = "OVERSPEEDING"


class AnomalySeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class AnomalyResult:
    anomaly_type: AnomalyType
    severity: AnomalySeverity
    confidence: float
    description: str
    camera_id: str
    camera_code: str
    bbox: Optional[Tuple[float, float, float, float]] = None  # (x1, y1, x2, y2) in 0..1 relative coords
    metrics: Dict[str, Any] = field(default_factory=dict)
    frame_timestamp_ms: float = 0.0


class BaseAnomalyDetector:
    """Base interface for specialized anomaly detectors in the CCTV grid."""

    def __init__(self, name: str) -> None:
        self.name = name

    def inspect(self, frame: Any, **kwargs) -> List[AnomalyResult]:
        raise NotImplementedError("Subclasses must implement inspect()")
