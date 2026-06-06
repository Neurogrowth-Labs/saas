from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AfriLingua AI Translator"
    environment: str = "development"
    default_provider: str = "african-foundation-sim"
    public_base_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173,chrome-extension://*"
    whatsapp_verify_token: str = "change-me"
    telegram_bot_token: str = ""
    messenger_verify_token: str = "change-me"
    instagram_verify_token: str = "change-me"
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AFRILINGUA_")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
