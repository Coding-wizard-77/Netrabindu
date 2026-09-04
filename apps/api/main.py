import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from apps.api.config import settings
from apps.api.database import init_db
from apps.api.dependencies import decode_access_token
from services.events.bus import event_bus
from services.alerts.ws_manager import alert_ws_manager

# Import all routers
from apps.api.routers import (
    auth, departments, cameras, events, vehicles, watchlists, alerts, health, metrics, audit
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("netrabindu-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Netrabindu Control Plane...")
    init_db()
    await event_bus.start()
    logger.info("Netrabindu Control Plane initialized successfully.")
    yield
    logger.info("Shutting down Netrabindu Control Plane...")
    await event_bus.stop()

app = FastAPI(
    title="Netrabindu CCTV Intelligence Platform",
    description="Registry-Anchored, Edge-First, Federation-Routed CCTV Intelligence Control Plane",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(cameras.router)
app.include_router(events.router)
app.include_router(vehicles.router)
app.include_router(watchlists.router)
app.include_router(alerts.router)
app.include_router(health.router)
app.include_router(metrics.router)
app.include_router(audit.router)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket, token: str = Query(...)):
    """Real-time live alert stream for operator command center."""
    try:
        # Validate JWT token on connection
        decode_access_token(token)
    except Exception as e:
        await websocket.close(code=1008, reason="Authentication failed")
        return

    await alert_ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive ping/pong
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        alert_ws_manager.disconnect(websocket)
    except Exception:
        alert_ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "platform": "Netrabindu CCTV Intelligence System",
        "jurisdiction": "Gujarat State Police & Departmental Federation",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
