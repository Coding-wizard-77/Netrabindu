import pytest
from services.health_monitor.monitor import health_monitor

def test_camera_health_state_machine():
    # Successful probe with normal latency -> ONLINE
    st1 = health_monitor.check_camera_state_transition(
        current_state="UNKNOWN",
        probe_success=True,
        latency_ms=45.0
    )
    assert st1 == "ONLINE"

    # Failed probe -> OFFLINE
    st2 = health_monitor.check_camera_state_transition(
        current_state="ONLINE",
        probe_success=False,
        latency_ms=5000.0
    )
    assert st2 == "OFFLINE"

    # Degraded probe (latency > 1000ms) -> DEGRADED
    st3 = health_monitor.check_camera_state_transition(
        current_state="ONLINE",
        probe_success=True,
        latency_ms=1250.0
    )
    assert st3 == "DEGRADED"

    # Recovery from OFFLINE -> ONLINE
    st4 = health_monitor.check_camera_state_transition(
        current_state="OFFLINE",
        probe_success=True,
        latency_ms=60.0
    )
    assert st4 == "ONLINE"
