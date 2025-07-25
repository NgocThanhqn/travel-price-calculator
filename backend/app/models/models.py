from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
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

class Customer(Base):
    """Bảng thông tin khách hàng"""
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String)
    notes = Column(Text)  # Ghi chú đặc biệt
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Booking(Base):
    """Bảng đặt chuyến đi với thông tin khách hàng"""
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    # Thông tin khách hàng
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_email = Column(String)
    
    # Thông tin chuyến đi
    from_address = Column(String, nullable=False)
    to_address = Column(String, nullable=False)
    from_lat = Column(Float, nullable=False)
    from_lng = Column(Float, nullable=False)
    to_lat = Column(Float, nullable=False)
    to_lng = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_minutes = Column(Float)
    calculated_price = Column(Float, nullable=False)
    
    # Thông tin đặt chuyến
    travel_date = Column(String)  # Ngày đi dự kiến
    travel_time = Column(String)  # Giờ đi dự kiến
    passenger_count = Column(Integer, default=1)  # Số hành khách
    vehicle_type = Column(String, default="4_seats")  # Loại xe
    notes = Column(Text)  # Ghi chú
    
    # Trạng thái
    booking_status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    config_used = Column(String, default="default")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())