from __future__ import annotations

import math
import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from .base import AnomalyResult, AnomalySeverity, AnomalyType, BaseAnomalyDetector


class TrafficRuleAnomalyDetector(BaseAnomalyDetector):
    """
    Evaluates high-priority traffic and highway safety anomalies:
    1. WRONG_WAY_DRIVING: Vehicle vector going against calibrated corridor traffic flow.
    2. EXPRESSWAY_PEDESTRIAN: Vulnerable pedestrian located in high-speed express corridors.
    3. ILLEGAL_STOPPING_HAZARD: Stationary vehicle lingering on live expressway traffic lanes (> 15s dwell).
    4. SUDDEN_CONGESTION_SURGE: Sudden multi-vehicle density spike / road blockage.
    """

    def __init__(self, name: str = "traffic-rule-engine") -> None:
        super().__init__(name)
        # Tracks stationary vehicle dwell: {track_id: {"first_seen": t, "x": x, "y": y, "dwell_s": s}}
        self.dwell_tracker: Dict[str, Dict[str, Any]] = {}
        # Trajectory history for wrong-way detection: {track_id: [(x, y, t)]}
        self.trajectory_history: Dict[str, List[Tuple[float, float, float]]] = {}

    def inspect_detections(
        self,
        tracked_objects: List[Dict[str, Any]],
        camera_id: str,
        camera_code: str,
        pts_ms: float,
        calibrated_heading_deg: float = 90.0  # Default expected corridor vector: 90 deg (East/South-bound)
    ) -> List[AnomalyResult]:
        results: List[AnomalyResult] = []
        now = time.time()

        vehicle_count = 0
        pedestrian_count = 0

        for obj in tracked_objects:
            cls_name = str(obj.get("class_name", "")).lower()
            track_id = str(obj.get("track_id", ""))
            x1, y1, x2, y2 = obj.get("bbox", (0.1, 0.1, 0.2, 0.2))
            cx = (x1 + x2) / 2.0
            cy = (y1 + y2) / 2.0
            conf = float(obj.get("confidence", 0.85))

            if "person" in cls_name or cls_name == "0":
                pedestrian_count += 1
                # Pedestrian on expressway / major highway junction
                results.append(
                    AnomalyResult(
                        anomaly_type=AnomalyType.EXPRESSWAY_PEDESTRIAN,
                        severity=AnomalySeverity.CRITICAL,
                        confidence=conf,
                        description=f"Pedestrian detected inside active vehicular corridor on {camera_code}!",
                        camera_id=camera_id,
                        camera_code=camera_code,
                        bbox=(x1, y1, x2, y2),
                        metrics={"zone": "EXPRESSWAY_LANE_1", "danger_level": "EXTREME"},
                        frame_timestamp_ms=pts_ms
                    )
                )

            elif "vehicle" in cls_name or "car" in cls_name or "truck" in cls_name or cls_name == "1":
                vehicle_count += 1

                # 1. Update trajectory history
                if track_id:
                    history = self.trajectory_history.setdefault(track_id, [])
                    history.append((cx, cy, now))
                    if len(history) > 30:
                        history.pop(0)

                    # Check Wrong-Way Driving if we have at least 5 frames of movement
                    if len(history) >= 5:
                        dx = history[-1][0] - history[0][0]
                        dy = history[-1][1] - history[0][1]
                        dist = math.hypot(dx, dy)

                        if dist > 0.08:  # Significant motion
                            # Angle in degrees (-180 to 180)
                            angle = math.degrees(math.atan2(dy, dx))
                            # Angle difference with expected corridor heading
                            angle_diff = abs((angle - calibrated_heading_deg + 180) % 360 - 180)
                            if angle_diff > 135.0:  # Traveling in near opposite direction!
                                results.append(
                                    AnomalyResult(
                                        anomaly_type=AnomalyType.WRONG_WAY_DRIVING,
                                        severity=AnomalySeverity.CRITICAL,
                                        confidence=min(0.98, conf + 0.05),
                                        description=f"CRITICAL: Vehicle {track_id} traveling in WRONG-WAY opposite lane vector on {camera_code}!",
                                        camera_id=camera_id,
                                        camera_code=camera_code,
                                        bbox=(x1, y1, x2, y2),
                                        metrics={
                                            "track_id": track_id,
                                            "measured_angle_deg": round(angle, 1),
                                            "expected_heading_deg": calibrated_heading_deg,
                                            "angular_deviation": round(angle_diff, 1)
                                        },
                                        frame_timestamp_ms=pts_ms
                                    )
                                )

                    # 2. Check Illegal Stopping / Dwell Hazard
                    dwell_info = self.dwell_tracker.setdefault(track_id, {"first_seen": now, "x": cx, "y": cy, "stationary_since": now})
                    drift = math.hypot(cx - dwell_info["x"], cy - dwell_info["y"])
                    if drift < 0.03:
                        dwell_time = now - dwell_info["stationary_since"]
                        if dwell_time >= 12.0:  # Stationary for >= 12 seconds in transit lane
                            results.append(
                                AnomalyResult(
                                    anomaly_type=AnomalyType.ILLEGAL_STOPPING_HAZARD,
                                    severity=AnomalySeverity.HIGH,
                                    confidence=0.91,
                                    description=f"Stationary Vehicle Hazard: Dwell time {dwell_time:.1f}s in active transit corridor on {camera_code}",
                                    camera_id=camera_id,
                                    camera_code=camera_code,
                                    bbox=(x1, y1, x2, y2),
                                    metrics={"dwell_seconds": round(dwell_time, 1), "track_id": track_id},
                                    frame_timestamp_ms=pts_ms
                                )
                            )
                    else:
                        # Reset stationary timer
                        dwell_info["x"] = cx
                        dwell_info["y"] = cy
                        dwell_info["stationary_since"] = now

        # 3. Check Sudden Congestion Surge (High simultaneous density in single focal zone)
        if vehicle_count >= 8:
            results.append(
                AnomalyResult(
                    anomaly_type=AnomalyType.SUDDEN_CONGESTION_SURGE,
                    severity=AnomalySeverity.MEDIUM,
                    confidence=0.88,
                    description=f"Traffic Density Surge: {vehicle_count} simultaneous vehicles queued at {camera_code}",
                    camera_id=camera_id,
                    camera_code=camera_code,
                    bbox=(0.0, 0.3, 1.0, 0.9),
                    metrics={"vehicle_density": vehicle_count},
                    frame_timestamp_ms=pts_ms
                )
            )

        return results
