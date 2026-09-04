import logging
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Any, List

logger = logging.getLogger("ai_models.evidence_buffer")

class RollingEvidenceBuffer:
    """Maintains 10s pre-event and 10s post-event rolling ring buffers."""
    
    def __init__(self, buffer_duration_seconds: int = 10, fps: int = 25):
        self.max_frames = buffer_duration_seconds * fps
        self.buffer = deque(maxlen=self.max_frames)
        
    def append_frame(self, frame, timestamp_iso: str):
        self.buffer.append({"frame": frame, "timestamp": timestamp_iso})
        
    def export_clip(self, event_id: str) -> str:
        # Generates MP4 clip reference path
        return f"/evidence/clips/{event_id}.mp4"

evidence_buffer = RollingEvidenceBuffer()
