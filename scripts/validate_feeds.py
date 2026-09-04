import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from apps.api.database import get_db_context
from services.camera_registry.models import Camera
from services.ingestion.validator import FeedValidator

async def validate_all_feeds():
    print("[*] Starting validation of all registered camera sources...")
    with get_db_context() as db:
        cameras = db.query(Camera).all()
        if not cameras:
            print("[*] No cameras currently registered in database.")
            return

        print(f"[*] Found {len(cameras)} camera(s) to probe.\n")
        for cam in cameras:
            print(f"--> Validating {cam.camera_code} ({cam.name}) [{cam.source_type}]...")
            res = await FeedValidator.validate_camera(cam.id, db)
            status_str = "[ONLINE]" if res["valid"] else "[OFFLINE/FAIL]"
            print(f"    Status: {status_str} (Latency: {res.get('latency_ms', 0)}ms)")
            if not res["valid"]:
                print(f"    Reason: {res.get('error_reason')}")

if __name__ == "__main__":
    asyncio.run(validate_all_feeds())
