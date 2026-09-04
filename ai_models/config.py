import os
from pydantic import BaseModel

class AIConfig(BaseModel):
    NODE_ID: str = os.getenv("EDGE_NODE_ID", "edge-sentinel-sg-01")
    REGION: str = os.getenv("EDGE_REGION", "S.G. Highway Command, Ahmedabad")
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:8000/api")
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    EVENT_TOPIC: str = "detection_events"
    
    # YOLO & OCR Models
    DETECTION_CONFIDENCE_THRESHOLD: float = 0.45
    OCR_CONFIDENCE_THRESHOLD: float = 0.85
    
    # Sentinel Adaptive Rates
    IDLE_FPS: int = 2
    NORMAL_FPS: int = 10
    ACTIVE_FPS: int = 20
    CRITICAL_FPS: int = 25
    
    # Pre/Post buffer
    PRE_EVENT_BUFFER_SECONDS: int = 10
    POST_EVENT_BUFFER_SECONDS: int = 10

ai_config = AIConfig()
