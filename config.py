from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    gemini_api_key: str = ""
    groq_api_key: str = ""
    hf_api_key: str = ""
    ibm_api_key: str = ""
    ibm_project_id: str = ""
    ibm_url: str = "https://us-south.ml.cloud.ibm.com"
    app_env: str = "development"
    app_port: int = 8000

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
