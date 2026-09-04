import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_ENV: str = "development"
    PUBLIC_BASE_URL: str = "http://localhost:8000"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./netrabindu.db"
    SYNC_DATABASE_URL: str = "sqlite:///./netrabindu.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Kafka / Redpanda
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_CLIENT_ID: str = "netrabindu-core"
    KAFKA_GROUP_ID: str = "netrabindu-group"
    KAFKA_USE_LOCAL_FALLBACK: bool = True

    # MinIO / S3
    OBJECT_STORE_ENDPOINT: str = "http://localhost:9000"
    OBJECT_STORE_ACCESS_KEY: str = "minioadmin"
    OBJECT_STORE_SECRET_KEY: str = "minioadmin"
    OBJECT_STORE_BUCKET: str = "evidence"
    OBJECT_STORE_USE_SSL: bool = False

    # MediaMTX
    MEDIAMTX_API_URL: str = "http://localhost:8554"
    MEDIAMTX_RTSP_URL: str = "rtsp://localhost:8554"
    MEDIAMTX_WEBRTC_URL: str = "http://localhost:8889"
    MEDIAMTX_HLS_URL: str = "http://localhost:8888"

    # Auth & Security
    JWT_ISSUER: str = "netrabindu-core"
    JWT_SECRET: str = "super-secret-key-min-32-characters-for-jwt-signing"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OIDC_ISSUER: str = ""
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:80,*"
    ALERT_WS_ORIGIN: str = "http://localhost:3000,http://localhost:5173,*"

    # Admin seed defaults
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "AdminSecurePass123!"
    ADMIN_EMAIL: str = "admin@police.gujarat.gov.in"
    ADMIN_DEPARTMENT: str = "DEPT-HQ"

    @property
    def cors_origin_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]

settings = Settings()
