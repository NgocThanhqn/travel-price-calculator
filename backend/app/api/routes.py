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