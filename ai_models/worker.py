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

from ai_models.sentinel_grid_ingestor import sentinel_ingestor

async def run_ai_edge_worker():
    await sentinel_ingestor.run_corridor_surveillance()

if __name__ == "__main__":
    try:
        asyncio.run(run_ai_edge_worker())
    except KeyboardInterrupt:
        logger.info("Edge AI Sentinel Worker stopped by operator.")
