from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from database.database import Base

class PriceConfig(Base):
    """Bảng cấu hình giá"""
    __tablename__ = "price_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    config_name = Column(String, unique=True, index=True)  # VD: "default", "peak_hour"
    base_price = Column(Float, default=10000)
    price_per_km = Column(Float, default=5000)
    min_price = Column(Float, default=20000)
    max_price = Column(Float, default=500000)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Trip(Base):
    """Bảng lưu lịch sử các chuyến đi"""
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    from_address = Column(String)
    to_address = Column(String)
    from_lat = Column(Float)
    from_lng = Column(Float)
    to_lat = Column(Float)
    to_lng = Column(Float)
    distance_km = Column(Float)
    duration_minutes = Column(Float)
    calculated_price = Column(Float)
    config_used = Column(String)  # Cấu hình giá được sử dụng
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Settings(Base):
    """Bảng cấu hình chung"""
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    description = Column(String)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())