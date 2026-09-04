import httpx
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from ai_models.config import ai_config

logger = logging.getLogger("ai_models.publisher")

class EventPublisher:
    """Publishes locked Event Contract JSON to Backend and Event Bus."""
    
    def __init__(self, backend_url: Optional[str] = None):
        self.backend_url = backend_url or ai_config.BACKEND_API_URL
        
    async def publish_detection(self, event_data: Dict[str, Any]) -> bool:
        """POST DetectionEvent according to contracts/event-contract.md"""
        target_endpoint = f"{self.backend_url}/events"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(target_endpoint, json=event_data)
                if res.status_code in (200, 201):
                    logger.info(f"Published detection {event_data.get('event_id')} -> {target_endpoint} (HTTP {res.status_code})")
                    return True
                else:
                    logger.warning(f"Backend returned HTTP {res.status_code} for event: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to publish event to {target_endpoint}: {e}")
            return False

event_publisher = EventPublisher()
