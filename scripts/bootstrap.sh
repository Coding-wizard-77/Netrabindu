#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "NETRABINDU — PRODUCTION PLATFORM BOOTSTRAP"
echo "Gujarat CCTV Hackathon 2026 — Control Plane Spine"
echo "=========================================================="

# 1. Environment & Directories
echo "[1/8] Verifying local directory structures and volumes..."
mkdir -p data/postgres data/redis data/minio data/mediamtx logs/
mkdir -p evidence/screenshots evidence/demo-videos evidence/anpr-results evidence/route-reports evidence/performance

# 2. Secrets initialization
echo "[2/8] Checking environment configuration (.env)..."
if [ ! -f ".env" ]; then
    echo "       Creating default .env from .env.example..."
    cp .env.example .env
fi

# 3. Check Docker / runtime
echo "[3/8] Checking Docker & Docker Compose availability..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "       Docker and Docker Compose are available."
    START_DOCKER=true
else
    echo "       [WARN] Docker not detected. Operating in local native process mode."
    START_DOCKER=false
fi

# 4. Start Infrastructure if Docker available
if [ "$START_DOCKER" = true ]; then
    echo "[4/8] Starting containerized core infrastructure..."
    docker compose up -d postgres redis redpanda minio mediamtx
    echo "       Waiting for database and message bus to stabilize..."
    sleep 5
else
    echo "[4/8] Skipping docker-compose up (Docker unavailable)."
fi

# 5. Run Database Migrations
echo "[5/8] Running database migrations..."
python -c "from apps.api.database import init_db; init_db(); print('       Database tables initialized successfully.')"

# 6. Provision Initial Admin & Roles
echo "[6/8] Provisioning initial Administrator and Department..."
python scripts/provision_admin.py

# 7. Verify Health
echo "[7/8] Verifying system health and readiness..."
python -c "
import asyncio
from apps.api.database import get_db_context
from services.health_monitor.monitor import health_monitor

async def check():
    with get_db_context() as db:
        res = await health_monitor.get_system_health(db)
        print(f'       System Status: {res[\"status\"]}')
        for k, v in res[\"components\"].items():
            print(f'       - {k}: {v}')

asyncio.run(check())
"

# 8. Complete & Dashboard URL
echo "[8/8] Bootstrap complete!"
echo ""
echo "=========================================================="
echo "NETRABINDU READY FOR OPERATIONS"
echo "API Endpoint:        http://localhost:8000"
echo "Interactive Swagger: http://localhost:8000/docs"
echo "Alerts WebSocket:    ws://localhost:8000/ws/alerts"
echo "Super Admin:         admin"
echo "Default Password:    AdminSecurePass123!"
echo "=========================================================="
