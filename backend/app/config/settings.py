import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Cấu hình database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///../../database/travel_calculator.db")
    
    # Cấu hình Google Maps
    GOOGLE_MAPS_API_KEY: str = "YOUR_API_KEY_HERE"
    
    # Cấu hình giá cơ bản
    BASE_PRICE: float = 10000
    PRICE_PER_KM: float = 5000
    MIN_PRICE: float = 20000
    MAX_PRICE: float = 500000
    
    # Cấu hình server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

# Tạo instance settings global
settings = Settings()