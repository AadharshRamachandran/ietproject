"""
AetherNet Backend  Application Configuration
Loads settings from .env file via pydantic-settings.
Validates environment variables for production deployment.
"""

import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    app_name: str="AetherNet"
    app_env: str="development"
    app_port: int=8000

    mongodb_uri: str
    mongodb_db_name: str="aethernet"

    clerk_frontend_api: str=""
    clerk_secret_key: str=""

    pinata_api_key: str=""
    pinata_api_secret: str=""
    pinata_jwt: str=""
    pinata_gateway: str = "https://gateway.pinata.cloud/ipfs/"

    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"

    fl_server_host: str="0.0.0.0"
    fl_server_port: int=8080
    fl_rounds: int=3
    fl_client_connect_host: str="127.0.0.1"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    def validate_production_settings(self) -> None:
        """Validate that all required settings are configured for production."""
        if not self.is_production:
            return

        required_fields = [
            ("mongodb_uri", "MongoDB URI is required in production"),
            ("clerk_secret_key", "Clerk secret key is required in production"),
            ("pinata_jwt", "Pinata JWT is required in production"),
            ("frontend_url", "Frontend URL is required in production"),
        ]

        missing_fields = []
        for field, message in required_fields:
            value = getattr(self, field, None)
            if not value or value == "":
                missing_fields.append(message)
                logger.error(f"❌ {message}")

        if missing_fields:
            raise ValueError(
                f"Production environment is missing required settings:\n" +
                "\n".join(missing_fields)
            )

        logger.info("✅ All production environment variables validated successfully")

    model_config=SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_production_settings()
    return settings
