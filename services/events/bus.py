import asyncio
import json
import logging
from typing import Dict, Any, Callable, List, Optional
from apps.api.config import settings

logger = logging.getLogger(__name__)

class EventBus:
    """Kafka/Redpanda abstraction with resilient local fallback queue."""

    def __init__(self):
        self.bootstrap_servers = settings.KAFKA_BOOTSTRAP_SERVERS
        self.use_fallback = settings.KAFKA_USE_LOCAL_FALLBACK
        self.subscribers: Dict[str, List[Callable]] = {}
        self._producer = None
        self._is_kafka_connected = False
        self._local_queue = asyncio.Queue()
        self._running = False

    async def start(self):
        self._running = True
        try:
            from aiokafka import AIOKafkaProducer
            self._producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                client_id=settings.KAFKA_CLIENT_ID,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None
            )
            await self._producer.start()
            self._is_kafka_connected = True
            logger.info(f"Connected to Kafka/Redpanda cluster at {self.bootstrap_servers}")
        except Exception as e:
            self._is_kafka_connected = False
            logger.info(f"Kafka unavailable ({e}). Operating in resilient local event bus mode.")

    async def stop(self):
        self._running = False
        if self._producer:
            try:
                await self._producer.stop()
            except Exception:
                pass

    async def publish(self, topic: str, value: Dict[str, Any], key: Optional[str] = None):
        """Publish event to topic; routes to Kafka or local subscriber callbacks."""
        # 1. Attempt Kafka produce if active
        if self._is_kafka_connected and self._producer:
            try:
                await self._producer.send_and_wait(topic, value=value, key=key)
                return
            except Exception as e:
                logger.warning(f"Kafka publish error on topic {topic}: {e}. Falling back to local dispatch.")

        # 2. Local in-process dispatch
        callbacks = self.subscribers.get(topic, [])
        for cb in callbacks:
            try:
                if asyncio.iscoroutinefunction(cb):
                    asyncio.create_task(cb(topic, value))
                else:
                    cb(topic, value)
            except Exception as e:
                logger.error(f"Error in local event subscriber for {topic}: {e}")

    def subscribe(self, topic: str, callback: Callable):
        """Register callback for topic."""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)

event_bus = EventBus()
