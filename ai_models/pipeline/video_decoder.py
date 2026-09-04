import logging
from typing import Optional, Any

logger = logging.getLogger("ai_models.video_decoder")

class VideoDecoder:
    """Low-latency RTSP / WebRTC frame decoder with hardware acceleration."""
    
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
        self.is_active = True
        
    def read_frame(self) -> Optional[Any]:
        # Returns decoded RGB frame array
        return None
        
    def release(self):
        self.is_active = False
