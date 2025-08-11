from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Schema cho cấu hình giá
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


class PriceTier(BaseModel):
    """Một bậc giá theo khoảng cách"""
    from_km: float
    to_km: Optional[float]  # None = không giới hạn  
    price_per_km: float
    description: Optional[str] = None

class TierPriceConfig(BaseModel):
    """Cấu hình giá theo bậc"""
    id: Optional[int] = None
    name: str
    base_price: float  # Giá khởi điểm
    tiers: List[PriceTier]
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class TierPriceConfigCreate(BaseModel):
    """Schema tạo cấu hình giá mới"""
    name: str
    base_price: float
    tiers: List[PriceTier]

class TierPriceConfigUpdate(BaseModel):
    """Schema cập nhật cấu hình giá"""
    name: Optional[str] = None
    base_price: Optional[float] = None
    tiers: Optional[List[PriceTier]] = None
    is_active: Optional[bool] = None

class TierPriceCalculationRequest(BaseModel):
    """Request tính giá theo bậc"""
    config_name: str
    distance_km: float

class TierPriceCalculationResponse(BaseModel):
    """Response tính giá theo bậc"""
    distance_km: float
    base_price: float
    total_price: float
    price_breakdown: List[dict]
    config_name: str

# Schema cho yêu cầu tính giá
class TripCalculationRequest(BaseModel):
    """Request để tính giá chuyến đi - Enhanced version"""
    # Có thể dùng coordinates hoặc distance
    from_lat: Optional[float] = None
    from_lng: Optional[float] = None
    to_lat: Optional[float] = None
    to_lng: Optional[float] = None
    
    # Hoặc dùng distance trực tiếp
    distance_km: Optional[float] = None
    
    # Thông tin địa chỉ
    from_address: Optional[str] = "Điểm A"
    to_address: Optional[str] = "Điểm B"
    
    # Thông tin bổ sung
    duration_minutes: Optional[float] = None
    vehicle_type: Optional[str] = "4_seats"

class TripCalculationResponse(BaseModel):
    distance_km: float
    duration_minutes: float
    calculated_price: float
    from_address: str
    to_address: str
    breakdown: dict
    
# Schema cho chuyến đi
class TripBase(BaseModel):
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    distance_km: float
    duration_minutes: float
    calculated_price: float
    config_used: str

class TripCreate(TripBase):
    pass

class Trip(TripBase):
    id: int
    from_address: str
    to_address: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schema cho đặt chuyến - THÊM MỚI
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

# Schema cho loại xe
class VehicleTypeInfo(BaseModel):
    type: str
    name: str
    description: str
    price_multiplier: float  # Hệ số nhân giá
    max_passengers: int

# Schema cho settings
class Settings(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True