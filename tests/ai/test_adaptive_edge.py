from datetime import datetime, timedelta, timezone

import pytest

from models.detection.yolo_like import YOLOLikeDetector
from models.ocr.paddle_ocr import PaddleOCRAdapter
from models.reid.embedding import LightweightReIDAdapter
from models.tracking.bytetrack import ByteTrackTracker
from services.adaptive_edge.engine import QualityState, AdaptiveController
from services.adaptive_edge.pipeline import AdaptivePipeline
from services.adaptive_edge.sentinel import ActivitySentinel
from services.adaptive_edge.telemetry import TelemetryRecorder
from services.analytics.events import build_edge_event, EvidenceRef, PipelineContext
from services.evidence.buffer import RollingEvidenceBuffer


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


def test_uncertainty_escalation_requires_high_risk():
    controller = AdaptiveController(cooldown_seconds=0)
    decision = controller.on_activity("cam-3", score=0.7, uncertainty=0.85)
    assert decision == QualityState.CRITICAL

    controller = AdaptiveController(cooldown_seconds=0)
    decision = controller.on_activity("cam-4", score=0.7, uncertainty=0.2)
    assert decision == QualityState.ACTIVE


def test_cooldown_prevents_quality_switch_thrash():
    controller = AdaptiveController(cooldown_seconds=30.0, quiet_threshold=0.2)
    controller.on_activity("cam-5", score=0.9)
    assert controller.current_state("cam-5") == QualityState.ACTIVE

    controller.on_activity("cam-5", score=0.6)
    assert controller.current_state("cam-5") == QualityState.ACTIVE


def test_indian_plate_normalization_and_tracker_dedupe():
    ocr = PaddleOCRAdapter()
    assert ocr.normalize_plate("gj 05 ab 1234") == "GJ05AB1234"
    assert ocr.normalize_plate("gj-05-ab-1234") == "GJ05AB1234"

    tracker = ByteTrackTracker()
    tracks = tracker.update([(1, 0.99, 0, 0, 100, 100), (1, 0.97, 10, 10, 110, 110)])
    assert len(tracks) == 2
    assert len(tracker.active_tracks()) == 2


def test_sentinel_and_event_contract_are_consistent():
    sentinel = ActivitySentinel()
    result = sentinel.evaluate(motion_score=0.8, scene_entropy=0.5, object_count=2)
    assert result.trigger is True
    assert result.quality_hint in {"Normal", "Active", "Critical"}

    recorder = TelemetryRecorder()
    metric = recorder.update_state("cam-telemetry", "Active")
    assert metric.adaptive_quality_state == "Active"

    event = build_edge_event(
        event_type="ANPR",
        camera_id="cam-telemetry",
        identifier_type="vehicle_plate",
        raw_identifier="gj05ab1234",
        normalized_identifier="GJ05AB1234",
        confidence=0.92,
        location=(23.0225, 72.5714),
        evidence=EvidenceRef(thumbnail_uri="s3://edge/thumb.jpg", clip_uri="s3://edge/clip.mp4"),
        pipeline=PipelineContext(
            node_id="edge-01",
            model_version="yolov8-plate-v1",
            source_frame_time="2026-09-04T10:00:00Z",
            quality_state="Active",
            inference_tier="high",
            escalation_reason="uncertainty-driven",
        ),
    )
    assert event.event_type == "ANPR"
    assert event.identifier.normalized == "GJ05AB1234"
    assert event.pipeline.quality_state == "Active"


def test_evidence_buffer_keeps_time_windowed_event_context():
    buffer = RollingEvidenceBuffer(max_seconds=30, pre_event_seconds=10, post_event_seconds=5)
    event_time = datetime(2026, 9, 4, 12, 0, tzinfo=timezone.utc)

    for offset in (-12, -8, -2, 0, 4, 9):
        ts = event_time + timedelta(seconds=offset)
        buffer.append(uri=f"s3://edge/{offset}.jpg", checksum=f"sha-{offset}", timestamp=ts)

    context = buffer.snapshot_for_event(event_time=event_time)
    assert len(context) == 4
    assert [frame.uri for frame in context] == [
        "s3://edge/-8.jpg",
        "s3://edge/-2.jpg",
        "s3://edge/0.jpg",
        "s3://edge/4.jpg",
    ]


def test_yolo_like_detector_and_reid_similarity_work():
    detector = YOLOLikeDetector()
    detections = detector.predict({"objects": ["vehicle", "person", "plate"]})
    assert len(detections.boxes) >= 1
    assert any(box.class_id == 2 for box in detections.boxes)

    reid = LightweightReIDAdapter()
    same = reid.compare([0.9, 0.8, 0.7], [0.91, 0.81, 0.71])
    diff = reid.compare([0.1, 0.2, 0.3], [0.9, 0.8, 0.7])
    assert same > 0.95
    assert diff < 0.5


def test_adaptive_pipeline_emits_state_and_quality_plan():
    pipeline = AdaptivePipeline()
    decision = pipeline.evaluate(camera_id="cam-pipeline", motion_score=0.8, scene_entropy=0.7, object_count=3, watchlist=False, uncertainty=0.6)
    assert decision["quality_state"] in {"Normal", "Active", "Critical"}
    assert decision["sentinel"]["trigger"] is True
    assert "inference_tier" in decision
    assert decision["reasons"]
