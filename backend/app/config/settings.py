from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/ecommerce_db"
    SECRET_KEY: str = "super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    APP_NAME: str = "ShopVista"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    settings_obj = Settings()
    if settings_obj.DATABASE_URL.startswith("mysql://"):
        settings_obj.DATABASE_URL = settings_obj.DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    return settings_obj


settings = get_settings()
