import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017/rootsreconnect"
    secret_key: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        extra = "ignore"  # Allow extra fields in .env
    )

settings = Settings()

# Also load from environment directly for LLM
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", settings.gemini_api_key)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", settings.openai_api_key)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", settings.anthropic_api_key)
