import pytest

from services.adaptive_edge.engine import QualityState, AdaptiveController


def test_quality_state_machine_tracks_idle_to_critical():
    controller = AdaptiveController()

    assert controller.current_state("cam-1") == QualityState.IDLE

    controller.on_activity("cam-1", score=0.6)
    assert controller.current_state("cam-1") == QualityState.NORMAL

    controller.on_activity("cam-1", score=0.8)
    assert controller.current_state("cam-1") == QualityState.ACTIVE

    controller.on_activity("cam-1", score=0.98, watchlist=True, uncertainty=0.9)
    assert controller.current_state("cam-1") == QualityState.CRITICAL


def test_state_changes_return_to_idle_after_quiet_period():
    controller = AdaptiveController(cooldown_seconds=0, quiet_threshold=0.2)
    controller.on_activity("cam-2", score=0.9)
    assert controller.current_state("cam-2") == QualityState.ACTIVE

    controller.on_activity("cam-2", score=0.1)
    assert controller.current_state("cam-2") == QualityState.IDLE
