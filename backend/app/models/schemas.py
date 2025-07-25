from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PriceConfigBase(BaseModel):
    config_name: str
    base_price: float
    price_per_km: float
    min_price: float
    max_price: float
    is_active: bool = True

class PriceConfigCreate(PriceConfigBase):
    pass

class PriceConfigUpdate(BaseModel):
    base_price: Optional[float] = None
    price_per_km: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_active: Optional[bool] = None

class PriceConfig(PriceConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TripCalculationRequest(BaseModel):
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    from_address: Optional[str] = None
    to_address: Optional[str] = None

class TripCalculationResponse(BaseModel):
    distance_km: float
    duration_minutes: float
    calculated_price: float
    from_address: str
    to_address: str
    breakdown: dict  # Chi tiết cách tính giá

class Trip(BaseModel):
    id: int
    from_address: str
    to_address: str
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    distance_km: float
    duration_minutes: float
    calculated_price: float
    config_used: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingRequest(BaseModel):
    # Thông tin khách hàng
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    
    # Thông tin chuyến đi
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    
    # Thông tin đặt chuyến
    travel_date: Optional[str] = None
    travel_time: Optional[str] = None
    passenger_count: int = 1
    vehicle_type: str = "4_seats"  # 4_seats, 7_seats, 16_seats
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    from_address: str
    to_address: str
    distance_km: float
    duration_minutes: Optional[float]
    calculated_price: float
    travel_date: Optional[str]
    travel_time: Optional[str]
    passenger_count: int
    vehicle_type: str
    notes: Optional[str]
    booking_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class VehicleTypeInfo(BaseModel):
    type: str
    name: str
    description: str
    price_multiplier: float  # Hệ số nhân giá
    max_passengers: int