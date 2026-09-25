import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add parent and backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(backend_dir.parent) not in sys.path:
    sys.path.insert(0, str(backend_dir.parent))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json

try:
    from backend.config import settings
    from backend.database import init_db
    from backend.dependencies import decode_access_token
    from backend.services.events.bus import event_bus
    from backend.services.alerts.ws_manager import alert_ws_manager
    from backend.routers import (
        auth, departments, cameras, events, vehicles, watchlists, alerts, health, metrics, audit, integrations, sentinel_grid
    )
    from backend.seed_data import seed_all_data
except ImportError:
    from config import settings
    from database import init_db
    from dependencies import decode_access_token
    from services.events.bus import event_bus
    from services.alerts.ws_manager import alert_ws_manager
    from routers import (
        auth, departments, cameras, events, vehicles, watchlists, alerts, health, metrics, audit, integrations, sentinel_grid
    )
    from seed_data import seed_all_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("netrabindu-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Netrabindu Backend Control Plane...")
    init_db()
    try:
        seed_all_data()
    except Exception as e:
        logger.warning(f"Seeding completed or encountered non-fatal note: {e}")
    await event_bus.start()
    async def _handle_anpr(topic, value):
        try:
            await alert_ws_manager.broadcast_alert(value)
        except Exception:
            pass

        dead = []
        for q in list(sse_clients):
            try:
                await q.put(json.dumps(value))
            except Exception:
                dead.append(q)

        for d in dead:
            if d in sse_clients:
                sse_clients.remove(d)

    event_bus.subscribe("anpr.events", _handle_anpr)
    logger.info("Netrabindu Backend Control Plane initialized successfully.")
    yield
    logger.info("Shutting down Netrabindu Backend Control Plane...")
    await event_bus.stop()

app = FastAPI(
    title="Netrabindu CCTV Intelligence Platform",
    description="Registry-Anchored, Edge-First, Federation-Routed CCTV Intelligence Control Plane for Gujarat Police",
    version="1.0.0",
    lifespan=lifespan
)

# SSE client registries (per-process)
sse_clients: set = set()


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Mount Static Evidence Directory for forensic image display
evidence_dir = os.path.join(backend_dir, "evidence")
os.makedirs(os.path.join(evidence_dir, "anomalies"), exist_ok=True)
app.mount("/evidence", StaticFiles(directory=evidence_dir), name="evidence")

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
app.include_router(integrations.router)
app.include_router(sentinel_grid.router)

@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    """Real-time live event & alert stream for web console."""
    token = websocket.query_params.get("token")
    await alert_ws_manager.connect(websocket)
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        alert_ws_manager.disconnect(websocket)
    except Exception:
        alert_ws_manager.disconnect(websocket)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """Real-time live alert stream for operator command center."""
    token = websocket.query_params.get("token")
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


@app.get("/sse/events")
async def sse_events():
    """Server-Sent Events stream for detection events."""
    q: asyncio.Queue = asyncio.Queue()
    sse_clients.add(q)

    async def event_generator():
        try:
            while True:
                data = await q.get()
                yield f"data: {data}\n\n"
        finally:
            if q in sse_clients:
                sse_clients.remove(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/")
async def root():
    return {
        "platform": "Netrabindu CCTV Intelligence Platform",
        "tier": "backend",
        "jurisdiction": "Gujarat State Police & Departmental Federation",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
