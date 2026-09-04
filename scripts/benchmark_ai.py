#!/usr/bin/env python3
"""Minimal benchmark runner for Engineer 2 AI workloads.

This is intentionally lightweight and uses synthetic activity patterns rather than
fabricating production telemetry. It is designed to validate the adaptive edge
state transitions and exercise the telemetry structure expected by the
implementation contract.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.adaptive_edge.engine import AdaptiveController, QualityState


def main() -> None:
    controller = AdaptiveController()
    camera_id = "cam-benchmark"

    states = [
        (0.1, False, 0.0),
        (0.6, False, 0.1),
        (0.82, False, 0.15),
        (0.96, True, 0.9),
        (0.1, False, 0.0),
    ]

    for score, watchlist, uncertainty in states:
        controller.on_activity(camera_id, score=score, watchlist=watchlist, uncertainty=uncertainty)
        print(f"score={score} state={controller.current_state(camera_id).value}")


if __name__ == "__main__":
    main()
