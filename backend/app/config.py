from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeaseGuard"
    API_V1_STR: str = "/api/v1"
    
    # API Keys
    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    DEEPGRAM_API_KEY: Optional[str] = None
    DEEPGRAM_PROJECT_ID: Optional[str] = None
    
    # Foxit Configuration
    FOXIT_API_BASE_URL: str = "https://na1.fusion.foxit.com"
    FOXIT_CLIENT_ID: Optional[str] = None
    FOXIT_CLIENT_SECRET: Optional[str] = None
    
    YOU_COM_API_KEY: Optional[str] = None
    
    # Sanity Config
    SANITY_PROJECT_ID: Optional[str] = None
    SANITY_DATASET: str = "production"
    SANITY_API_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
