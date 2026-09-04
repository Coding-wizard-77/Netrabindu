import json
import logging
from typing import List, Dict, Any, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class AlertWebSocketManager:
    """Manages real-time WebSocket client connections and alert dispatching."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: Dict[str, Any]):
        """Broadcast alert payload to all connected clients."""
        if not self.active_connections:
            return

        message = json.dumps({
            "type": "ALERT_NEW",
            "data": alert_data
        })

        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send to WS client: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_alert_update(self, alert_id: str, state: str, updated_by: str):
        """Broadcast status change to clients."""
        if not self.active_connections:
            return

        message = json.dumps({
            "type": "ALERT_UPDATE",
            "data": {
                "alert_id": alert_id,
                "state": state,
                "updated_by": updated_by
            }
        })

        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(dead)

alert_ws_manager = AlertWebSocketManager()
