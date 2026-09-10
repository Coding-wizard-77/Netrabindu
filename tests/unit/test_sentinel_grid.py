"""
Test suite for Sentinel Camera Grid integration according to the
Gujarat Police Innovation Challenge 2026 Integrator's Guide.
"""
import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from unittest.mock import patch, MagicMock
from backend.services.sentinel_grid.ingest_catalog import SentinelIngestCatalogService
from ai_models.pipeline.video_decoder import VideoDecoder

client = TestClient(app)

def test_sentinel_ingest_catalog_structure():
    """Verify that /api/ingest complies strictly with the official specification."""
    res = client.get("/api/ingest")
    assert res.status_code == 200
    data = res.json()
    items = data.get("catalogue", data.get("cameras", []))
    assert len(items) > 0

    for cam in items:
        # Required catalogue contract fields
        assert "id" in cam
        assert "location" in cam
        assert "codec" in cam
        assert "live" in cam
        assert "rtsp_url" in cam
        assert "whep_url" in cam
        assert "hls_url" in cam
        assert "stream_url" in cam

        # Protocol URL structure checks
        assert "/stream/" in cam["rtsp_url"]
        assert "/whep" in cam["whep_url"]
        assert "index.m3u8" in cam["hls_url"]
        assert cam["codec"] in ["H.264", "H.265", "H264", "H265"]
        assert isinstance(cam["live"], bool)

def test_sync_external_endpoint_graceful_handling():
    """Verify that /api/sentinel/sync-external handles external URLs gracefully."""
    res = client.post(
        "/api/sentinel/sync-external",
        json={"sandbox_url": "http://127.0.0.1:9999"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert "message" in data

@patch("ai_models.pipeline.video_decoder.cv2.VideoCapture")
def test_video_decoder_forces_rtsp_tcp(mock_vcap):
    """Verify Rule 1: OPENCV_FFMPEG_CAPTURE_OPTIONS must force rtsp_transport;tcp."""
    mock_instance = MagicMock()
    mock_instance.isOpened.return_value = True
    mock_vcap.return_value = mock_instance

    decoder = VideoDecoder("rtsp://localhost:8554/stream/1")
    assert "rtsp_transport;tcp" in os.environ.get("OPENCV_FFMPEG_CAPTURE_OPTIONS", "")
    assert decoder.reconnect_delay == 2.0
    assert decoder.max_reconnect_delay == 30.0
    decoder.release()

@patch("ai_models.pipeline.video_decoder.cv2.VideoCapture")
def test_video_decoder_pts_progression(mock_vcap):
    """Verify Rule 2: Monotonic PTS time progression without crash."""
    mock_instance = MagicMock()
    mock_instance.isOpened.return_value = True
    mock_instance.read.return_value = (True, "mock_frame")
    mock_instance.get.side_effect = [100.0, 140.0]
    mock_vcap.return_value = mock_instance

    decoder = VideoDecoder("rtsp://localhost:8554/stream/1")
    ok1, frame1, pts1 = decoder.read_frame()
    ok2, frame2, pts2 = decoder.read_frame()
    assert ok1 is True
    assert ok2 is True
    assert pts2 > pts1
    decoder.release()
