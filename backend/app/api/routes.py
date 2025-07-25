from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.crud import price_config_crud, trip_crud, settings_crud
from models.schemas import (
    PriceConfig, PriceConfigCreate, PriceConfigUpdate,
    TripCalculationRequest, TripCalculationResponse,
    Trip
)
from utils.price_calculator import PriceCalculator
from models.schemas import BookingRequest, BookingResponse

router = APIRouter()

# API tính giá chuyến đi
@router.post("/calculate-price", response_model=dict)
async def calculate_trip_price(
    request: TripCalculationRequest,
    db: Session = Depends(get_db)
):
    """Tính giá cho một chuyến đi"""
    try:
        # Lấy cấu hình giá hiện tại
        config = price_config_crud.get_config(db, "default")
        if not config:
            raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình giá")
        
        # Tạo calculator
        calculator = PriceCalculator(
            base_price=config.base_price,
            price_per_km=config.price_per_km,
            min_price=config.min_price,
            max_price=config.max_price
        )
        
        # Tính toán
        result = calculator.calculate_trip(request)
        
        # Lưu vào database
        trip_data = {
            "from_address": result["from_address"],
            "to_address": result["to_address"],
            "from_lat": request.from_lat,
            "from_lng": request.from_lng,
            "to_lat": request.to_lat,
            "to_lng": request.to_lng,
            "distance_km": result["distance_km"],
            "duration_minutes": result["duration_minutes"],
            "calculated_price": result["calculated_price"],
            "config_used": "default"
        }
        trip_crud.create_trip(db, trip_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính toán: {str(e)}")

# API quản lý cấu hình giá
@router.get("/price-configs", response_model=List[PriceConfig])
async def get_price_configs(db: Session = Depends(get_db)):
    """Lấy tất cả cấu hình giá"""
    return price_config_crud.get_all_configs(db)

@router.get("/price-configs/{config_name}", response_model=PriceConfig)
async def get_price_config(config_name: str, db: Session = Depends(get_db)):
    """Lấy cấu hình giá theo tên"""
    config = price_config_crud.get_config(db, config_name)
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    return config

@router.post("/price-configs", response_model=PriceConfig)
async def create_price_config(
    config: PriceConfigCreate,
    db: Session = Depends(get_db)
):
    """Tạo cấu hình giá mới"""
    return price_config_crud.create_config(db, config)

@router.put("/price-configs/{config_name}", response_model=PriceConfig)
async def update_price_config(
    config_name: str,
    config_update: PriceConfigUpdate,
    db: Session = Depends(get_db)
):
    """Cập nhật cấu hình giá"""
    updated_config = price_config_crud.update_config(db, config_name, config_update)
    if not updated_config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    return updated_config

# API lịch sử chuyến đi
@router.get("/trips", response_model=List[Trip])
async def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lấy lịch sử các chuyến đi"""
    return trip_crud.get_trips(db, skip=skip, limit=limit)

# API test đơn giản
@router.get("/test-distance")
async def test_distance():
    """Test tính khoảng cách"""
    calculator = PriceCalculator(10000, 5000, 20000, 500000)
    
    # Test: Từ Quận 1 đến Quận 7 (tọa độ giả định)
    distance = calculator.calculate_distance(
        10.762622, 106.660172,  # Quận 1
        10.732599, 106.719749   # Quận 7
    )
    
    price_info = calculator.calculate_price(distance)
    
    return {
        "from": "Quận 1, TP.HCM",
        "to": "Quận 7, TP.HCM",
        "distance_km": distance,
        "price_info": price_info
    }

# Thêm vào cuối file routes.py

# API quản lý settings
@router.get("/settings/{key}")
async def get_setting(key: str, db: Session = Depends(get_db)):
    """Lấy giá trị setting theo key"""
    setting = settings_crud.get_setting(db, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting không tồn tại")
    return {"key": setting.key, "value": setting.value, "description": setting.description}

@router.post("/settings")
async def update_setting(
    key: str,
    value: str,
    description: str = "",
    db: Session = Depends(get_db)
):
    """Cập nhật setting"""
    try:
        setting = settings_crud.update_setting(db, key, value, description)
        return {"message": "Cập nhật setting thành công", "setting": {
            "key": setting.key,
            "value": setting.value,
            "description": setting.description
        }}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật setting: {str(e)}")

@router.get("/settings")
async def get_all_settings(db: Session = Depends(get_db)):
    """Lấy tất cả settings"""
    settings = db.query(models.Settings).all()
    return [{"key": s.key, "value": s.value, "description": s.description} for s in settings]

@router.post("/bookings", response_model=dict)
async def create_booking(
    booking: BookingRequest,
    db: Session = Depends(get_db)
):
    """Tạo đặt chuyến với thông tin khách hàng"""
    try:
        # Lấy cấu hình giá
        config = price_config_crud.get_config(db, "default")
        if not config:
            raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình giá")
        
        # Tính giá theo loại xe
        vehicle_multiplier = {
            "4_seats": 1.0,
            "7_seats": 1.2,
            "16_seats": 1.5
        }.get(booking.vehicle_type, 1.0)
        
        # Tạo calculator với hệ số xe
        calculator = PriceCalculator(
            base_price=config.base_price * vehicle_multiplier,
            price_per_km=config.price_per_km * vehicle_multiplier,
            min_price=config.min_price * vehicle_multiplier,
            max_price=config.max_price * vehicle_multiplier
        )
        
        # Tính toán khoảng cách và giá
        distance = calculator.calculate_distance(
            booking.from_lat, booking.from_lng,
            booking.to_lat, booking.to_lng
        )
        
        price_info = calculator.calculate_price(distance)
        duration = (distance / 40) * 60  # 40km/h average speed
        
        # Tạo booking record
        booking_data = {
            "customer_name": booking.customer_name,
            "customer_phone": booking.customer_phone,
            "customer_email": booking.customer_email,
            "from_address": booking.from_address or f"{booking.from_lat}, {booking.from_lng}",
            "to_address": booking.to_address or f"{booking.to_lat}, {booking.to_lng}",
            "from_lat": booking.from_lat,
            "from_lng": booking.from_lng,
            "to_lat": booking.to_lat,
            "to_lng": booking.to_lng,
            "distance_km": distance,
            "duration_minutes": round(duration, 1),
            "calculated_price": price_info["final_price"],
            "travel_date": booking.travel_date,
            "travel_time": booking.travel_time,
            "passenger_count": booking.passenger_count,
            "vehicle_type": booking.vehicle_type,
            "notes": booking.notes,
            "booking_status": "pending",
            "config_used": "default"
        }
        
        # Lưu vào database
        db_booking = models.Booking(**booking_data)
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        
        return {
            "success": True,
            "booking_id": db_booking.id,
            "message": "Đặt chuyến thành công!",
            "booking_info": {
                "customer_name": db_booking.customer_name,
                "customer_phone": db_booking.customer_phone,
                "from_address": db_booking.from_address,
                "to_address": db_booking.to_address,
                "distance_km": db_booking.distance_km,
                "duration_minutes": db_booking.duration_minutes,
                "calculated_price": db_booking.calculated_price,
                "vehicle_type": db_booking.vehicle_type,
                "passenger_count": db_booking.passenger_count,
                "travel_date": db_booking.travel_date,
                "travel_time": db_booking.travel_time,
                "booking_status": db_booking.booking_status
            },
            "price_breakdown": price_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo đặt chuyến: {str(e)}")

@router.get("/bookings", response_model=List[dict])
async def get_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lấy danh sách đặt chuyến"""
    bookings = db.query(models.Booking).order_by(models.Booking.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": b.id,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "from_address": b.from_address,
            "to_address": b.to_address,
            "distance_km": b.distance_km,
            "calculated_price": b.calculated_price,
            "vehicle_type": b.vehicle_type,
            "passenger_count": b.passenger_count,
            "travel_date": b.travel_date,
            "travel_time": b.travel_time,
            "booking_status": b.booking_status,
            "created_at": b.created_at.isoformat() if b.created_at else None
        }
        for b in bookings
    ]

@router.get("/vehicle-types")
async def get_vehicle_types():
    """Lấy thông tin các loại xe"""
    return {
        "4_seats": {
            "name": "Xe 4 chỗ",
            "description": "Phù hợp cho 1-3 khách",
            "price_multiplier": 1.0,
            "max_passengers": 4
        },
        "7_seats": {
            "name": "Xe 7 chỗ", 
            "description": "Phù hợp cho 4-6 khách",
            "price_multiplier": 1.2,
            "max_passengers": 7
        },
        "16_seats": {
            "name": "Xe 16 chỗ",
            "description": "Phù hợp cho 7-15 khách", 
            "price_multiplier": 1.5,
            "max_passengers": 16
        }
    }