import asyncio
import logging
import random
from ai_models.config import ai_config
from ai_models.pipeline.inference_pipeline import inference_pipeline
from ai_models.publisher.event_publisher import event_publisher

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [AI_WORKER]: %(message)s")
logger = logging.getLogger("ai_models.worker")

# Sample camera network points across Gujarat
CORRIDOR_CAMERAS = [
    {"id": "cam-01", "code": "CAM-SG-01", "name": "Pakwan Cross Road", "lat": 23.0330, "lon": 72.5120},
    {"id": "cam-02", "code": "CAM-SG-02", "name": "Iskcon Flyover Junction", "lat": 23.0275, "lon": 72.5080},
    {"id": "cam-03", "code": "CAM-SG-03", "name": "Gota Cross Road Checkpost", "lat": 23.0780, "lon": 72.5290},
    {"id": "cam-04", "code": "CAM-RING-04", "name": "Sanand Circle Checkpoint", "lat": 22.9980, "lon": 72.4850},
    {"id": "cam-05", "code": "CAM-AIRPORT-05", "name": "SVPI Airport Toll Plaza", "lat": 23.0734, "lon": 72.6266}
]

SAMPLE_TARGET_PLATES = [
    "GJ01AB1234",
    "GJ01CD5678",
    "GJ27XY9999",
    "GJ05JK4321",
    "GJ06MN7777",
    "GJ18PQ8888"
]

async def run_ai_edge_worker():
    logger.info("=" * 65)
    logger.info(f"NetraBindu Edge AI Sentinel Worker starting on Node: {ai_config.NODE_ID}")
    logger.info(f"Region: {ai_config.REGION}")
    logger.info(f"Target Backend API: {ai_config.BACKEND_API_URL}")
    logger.info("=" * 65)
    
    iteration = 0
    while True:
        iteration += 1
        cam = random.choice(CORRIDOR_CAMERAS)
        plate = random.choice(SAMPLE_TARGET_PLATES)
        
        # Simulate adaptive quality state
        quality = random.choices(["Normal", "Active", "Critical"], weights=[0.6, 0.3, 0.1])[0]
        
        # Execute vision inference
        event = inference_pipeline.process_frame(
            frame=None,
            camera_id=cam["id"],
            camera_code=cam["code"],
            lat=cam["lat"],
            lon=cam["lon"],
            quality_state=quality,
            synthetic_plate=plate
        )
        
        logger.info(f"[Frame Ingest] Cam: {cam['code']} ({cam['name']}) | Plate: {plate} | State: {quality}")
        
        # Push event to backend
        await event_publisher.publish_detection(event)
        
        # Interval between surveillance detections (adaptive interval)
        sleep_interval = random.uniform(3.0, 7.0)
        await asyncio.sleep(sleep_interval)

if __name__ == "__main__":
    try:
        asyncio.run(run_ai_edge_worker())
    except KeyboardInterrupt:
        logger.info("Edge AI Worker stopped by operator.")
