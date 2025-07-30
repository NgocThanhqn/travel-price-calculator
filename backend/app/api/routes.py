# backend/app/api/routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Import database và models
from database.database import get_db
from database.crud import price_config_crud, trip_crud, settings_crud
from models import models
from models.schemas import (
    PriceConfig, PriceConfigCreate, PriceConfigUpdate,
    TripCalculationRequest, TripCalculationResponse,
    BookingRequest, BookingResponse,
    Trip
)
from utils.price_calculator import PriceCalculator
# Import address router trực tiếp - CÁCH NÀY ĐỠN GIẢN HƠN
from .address import router as address_router

router = APIRouter()
# Include address routes vào router chính
router.include_router(address_router, tags=["address"])

# API tính giá chuyến đi
@router.post("/calculate-price", response_model=dict)
async def calculate_trip_price(
    request: TripCalculationRequest,
    db: Session = Depends(get_db)
):
    """Tính giá cho một chuyến đi"""
    try:
        # Lấy cấu hình giá
        config = price_config_crud.get_config(db, "default")
        if not config:
            raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình giá")
        
        # Tính giá theo loại xe nếu có
        vehicle_multiplier = {
            "4_seats": 1.0,
            "7_seats": 1.2,
            "16_seats": 1.5
        }.get(getattr(request, 'vehicle_type', '4_seats'), 1.0)
        
        # Tạo calculator
        calculator = PriceCalculator(
            base_price=config.base_price * vehicle_multiplier,
            price_per_km=config.price_per_km * vehicle_multiplier,
            min_price=config.min_price * vehicle_multiplier,
            max_price=config.max_price * vehicle_multiplier
        )
        
        # Tính toán
        result = calculator.calculate_trip(request)
        
        # Lưu vào database (nếu cần)
        trip_data = {
            "from_lat": request.from_lat,
            "from_lng": request.from_lng,
            "to_lat": request.to_lat,
            "to_lng": request.to_lng,
            "distance_km": result["distance_km"],
            "duration_minutes": result["duration_minutes"],
            "calculated_price": result["calculated_price"],
            "config_used": "default"
        }
        
        # Tạo trip record
        db_trip = trip_crud.create_trip(db, trip_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính toán: {str(e)}")

# API test khoảng cách
@router.get("/test-distance")
async def test_distance_calculation():
    """Test API để kiểm tra tính khoảng cách"""
    try:
        calculator = PriceCalculator()
        
        # Test với 2 điểm ở HCM
        from_lat, from_lng = 10.762622, 106.660172  # Quận 1
        to_lat, to_lng = 10.732599, 106.719749      # Quận 7
        
        # Fake request object
        class TestRequest:
            from_lat = from_lat
            from_lng = from_lng
            to_lat = to_lat
            to_lng = to_lng
            from_address = "Quận 1, TP.HCM"
            to_address = "Quận 7, TP.HCM"
        
        result = calculator.calculate_trip(TestRequest())
        
        return {
            **result,
            "message": "✅ Test thành công!",
            "test_data": {
                "from": "Quận 1, TP.HCM",
                "to": "Quận 7, TP.HCM"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi test: {str(e)}")

# API tạo đặt chuyến
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

# API lấy danh sách đặt chuyến
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

# API lấy thông tin loại xe
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

# API quản lý cấu hình giá
@router.get("/price-configs")
async def get_price_configs(db: Session = Depends(get_db)):
    """Lấy tất cả cấu hình giá"""
    return price_config_crud.get_all_configs(db)

@router.get("/price-configs/{config_name}")
async def get_price_config(config_name: str, db: Session = Depends(get_db)):
    """Lấy cấu hình giá theo tên"""
    config = price_config_crud.get_config(db, config_name)
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    return config

@router.post("/price-configs")
async def create_price_config(config: PriceConfigCreate, db: Session = Depends(get_db)):
    """Tạo cấu hình giá mới"""
    return price_config_crud.create_config(db, config)

@router.put("/price-configs/{config_name}")
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

# API quản lý lịch sử chuyến đi
@router.get("/trips")
async def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lấy lịch sử các chuyến đi"""
    return trip_crud.get_trips(db, skip, limit)

# Import Google Maps calculator
try:
    from utils.google_maps_calculator import GoogleMapsDistanceCalculator
    GOOGLE_MAPS_AVAILABLE = True
except ImportError:
    GOOGLE_MAPS_AVAILABLE = False

# API test Google Maps với fallback
@router.get("/test-google-maps")
async def test_google_maps():
    """Test Google Maps API với fallback mechanism - FIXED VERSION"""
    try:
        if not GOOGLE_MAPS_AVAILABLE:
            return {
                "status": "unavailable",
                "message": "Google Maps library không có sẵn",
                "will_use_fallback": True,
                "google_maps_available": False,
                "fallback_available": True
            }
        
        # Test Google Maps
        print("🧪 Testing Google Maps connection...")
        gmaps_calc = GoogleMapsDistanceCalculator()
        
        if not gmaps_calc.has_api_key:
            return {
                "status": "no_api_key",
                "message": "Chưa cấu hình Google Maps API key trong database",
                "will_use_fallback": True,
                "google_maps_available": True,
                "fallback_available": True,
                "has_api_key": False
            }
        
        # Thực hiện test connection
        test_result = gmaps_calc.test_connection()
        
        return {
            **test_result,
            "google_maps_available": GOOGLE_MAPS_AVAILABLE,
            "fallback_available": True,
            "has_api_key": gmaps_calc.has_api_key
        }
        
    except Exception as e:
        print(f"❌ Error in test_google_maps endpoint: {e}")
        return {
            "status": "endpoint_error",
            "message": f"Lỗi trong endpoint test: {str(e)}",
            "will_use_fallback": True,
            "google_maps_available": GOOGLE_MAPS_AVAILABLE,
            "fallback_available": True
        }

# Thêm endpoint debug chi tiết hơn
@router.get("/debug/detailed-google-maps-test")
async def detailed_google_maps_test(db: Session = Depends(get_db)):
    """Debug chi tiết cho Google Maps"""
    try:
        result = {
            "step1_library_check": GOOGLE_MAPS_AVAILABLE,
            "step2_api_key_check": None,
            "step3_client_init": None,
            "step4_api_call": None,
            "final_recommendation": None
        }
        
        # Step 1: Library check (đã có)
        if not GOOGLE_MAPS_AVAILABLE:
            result["final_recommendation"] = "Cài đặt: pip install googlemaps"
            return result
        
        # Step 2: API key check
        setting = db.query(models.Settings).filter(
            models.Settings.key == "google_maps_api_key"
        ).first()
        
        if not setting or not setting.value or setting.value == "YOUR_API_KEY_HERE":
            result["step2_api_key_check"] = {
                "status": "no_valid_key",
                "message": "Không có API key hợp lệ trong database"
            }
            result["final_recommendation"] = "Cấu hình API key trong admin page"
            return result
        
        api_key = setting.value
        result["step2_api_key_check"] = {
            "status": "has_key",
            "key_length": len(api_key),
            "key_preview": api_key[:10] + "..." + api_key[-5:]
        }
        
        # Step 3: Client initialization
        try:
            import googlemaps
            gmaps = googlemaps.Client(key=api_key)
            result["step3_client_init"] = {
                "status": "success",
                "message": "Google Maps client khởi tạo thành công"
            }
        except Exception as e:
            result["step3_client_init"] = {
                "status": "failed",
                "error": str(e)
            }
            result["final_recommendation"] = f"Lỗi client init: {str(e)}"
            return result
        
        # Step 4: API call test
        try:
            directions_result = gmaps.directions(
                origin=(10.762622, 106.660172),
                destination=(10.732599, 106.719749),
                mode="driving"
            )
            
            if directions_result:
                route = directions_result[0]
                leg = route['legs'][0]
                
                result["step4_api_call"] = {
                    "status": "success",
                    "distance": leg['distance']['text'],
                    "duration": leg['duration']['text'],
                    "start": leg['start_address'],
                    "end": leg['end_address']
                }
                result["final_recommendation"] = "Google Maps API hoạt động hoàn hảo!"
            else:
                result["step4_api_call"] = {
                    "status": "no_results",
                    "message": "API call thành công nhưng không có kết quả"
                }
                
        except googlemaps.exceptions.ApiError as e:
            result["step4_api_call"] = {
                "status": "api_error",
                "error": str(e),
                "error_type": "ApiError"
            }
            result["final_recommendation"] = f"Lỗi API: {str(e)} - Kiểm tra enable Directions API"
            
        except googlemaps.exceptions.HTTPError as e:
            result["step4_api_call"] = {
                "status": "http_error", 
                "error": str(e),
                "error_type": "HTTPError"
            }
            result["final_recommendation"] = f"Lỗi HTTP: {str(e)} - Kiểm tra API key và quota"
            
        except Exception as e:
            result["step4_api_call"] = {
                "status": "unknown_error",
                "error": str(e),
                "error_type": type(e).__name__
            }
            result["final_recommendation"] = f"Lỗi không xác định: {str(e)}"
        
        return result
        
    except Exception as e:
        return {
            "status": "debug_error",
            "message": f"Lỗi trong debug: {str(e)}"
        }

# API tính giá với Google Maps (enhanced)
@router.post("/calculate-price-enhanced", response_model=dict)
async def calculate_price_enhanced(
    request: TripCalculationRequest,
    db: Session = Depends(get_db)
):
    """Tính giá với Google Maps và fallback mechanism"""
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
        }.get(getattr(request, 'vehicle_type', '4_seats'), 1.0)
        
        # Tạo smart calculator
        calculator = PriceCalculator(
            base_price=config.base_price * vehicle_multiplier,
            price_per_km=config.price_per_km * vehicle_multiplier,
            min_price=config.min_price * vehicle_multiplier,
            max_price=config.max_price * vehicle_multiplier,
            use_google_maps=True  # Enable Google Maps với fallback
        )
        
        # Tính toán
        result = calculator.calculate_trip(request)
        
        # Lưu vào database
        trip_data = {
            "from_lat": request.from_lat,
            "from_lng": request.from_lng,
            "to_lat": request.to_lat,
            "to_lng": request.to_lng,
            "distance_km": result["distance_km"],
            "duration_minutes": result["duration_minutes"],
            "calculated_price": result["calculated_price"],
            "config_used": "default"
        }
        
        db_trip = trip_crud.create_trip(db, trip_data)
        
        # Thêm metadata
        result["metadata"] = {
            "calculation_method": result.get("calculation_method"),
            "vehicle_multiplier": vehicle_multiplier,
            "google_maps_available": GOOGLE_MAPS_AVAILABLE,
            "trip_id": db_trip.id if db_trip else None,
            "calculation_status": calculator.get_calculation_status()
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính toán: {str(e)}")

# API kiểm tra status tính toán
@router.get("/calculation-status")
async def get_calculation_status():
    """Kiểm tra khả năng tính toán hiện tại"""
    try:
        # Tạo calculator để check status
        calculator = PriceCalculator(10000, 5000, 20000, 500000, use_google_maps=True)
        status = calculator.get_calculation_status()
        
        return {
            **status,
            "api_endpoints": {
                "enhanced": "/api/calculate-price-enhanced",
                "basic": "/api/calculate-price",
                "test": "/api/test-google-maps"
            },
            "recommendations": {
                "use_enhanced": status["google_maps_ready"],
                "message": "Sử dụng enhanced API để có khoảng cách chính xác nhất" if status["google_maps_ready"] else "Đang sử dụng fallback method, cấu hình Google Maps để có kết quả chính xác hơn"
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi kiểm tra status: {str(e)}",
            "google_maps_available": False,
            "google_maps_ready": False
        }

# test config Google Maps

@router.get("/debug/google-maps-config")
async def debug_google_maps_config(db: Session = Depends(get_db)):
    """Debug: Kiểm tra cấu hình Google Maps"""
    try:
        # Lấy API key từ database
        setting = db.query(models.Settings).filter(
            models.Settings.key == "google_maps_api_key"
        ).first()
        
        if not setting or not setting.value:
            return {
                "status": "no_api_key",
                "message": "Chưa có API key trong database",
                "has_setting": False,
                "api_key_preview": None
            }
        
        api_key = setting.value
        
        # Kiểm tra format API key
        if api_key == "YOUR_API_KEY_HERE":
            return {
                "status": "default_key",
                "message": "Đang sử dụng API key mặc định, cần thay thế",
                "has_setting": True,
                "api_key_preview": "YOUR_API_KEY_HERE"
            }
        
        # Kiểm tra độ dài API key (Google Maps API key thường dài 39 ký tự)
        if len(api_key) < 30:
            return {
                "status": "invalid_format",
                "message": f"API key quá ngắn ({len(api_key)} ký tự)",
                "has_setting": True,
                "api_key_preview": api_key[:10] + "..." if len(api_key) > 10 else api_key
            }
        
        return {
            "status": "has_key",
            "message": "Có API key trong database",
            "has_setting": True,
            "api_key_preview": api_key[:10] + "..." + api_key[-5:],
            "api_key_length": len(api_key),
            "updated_at": setting.updated_at.isoformat() if setting.updated_at else None
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi kiểm tra cấu hình: {str(e)}",
            "has_setting": False
        }

@router.get("/debug/test-raw-google-maps")
async def test_raw_google_maps(db: Session = Depends(get_db)):
    """Debug: Test Google Maps API trực tiếp với thông tin chi tiết"""
    try:
        # Lấy API key
        setting = db.query(models.Settings).filter(
            models.Settings.key == "google_maps_api_key"
        ).first()
        
        if not setting or not setting.value or setting.value == "YOUR_API_KEY_HERE":
            return {
                "status": "no_valid_key",
                "message": "Không có API key hợp lệ"
            }
        
        api_key = setting.value
        
        # Import và test Google Maps
        import googlemaps
        
        try:
            # Tạo client
            gmaps = googlemaps.Client(key=api_key)
            
            # Test với request đơn giản
            directions_result = gmaps.directions(
                origin=(10.762622, 106.660172),  # Quận 1
                destination=(10.732599, 106.719749),  # Quận 7
                mode="driving",
                language="vi"
            )
            
            if directions_result:
                route = directions_result[0]
                leg = route['legs'][0]
                
                return {
                    "status": "success",
                    "message": "Google Maps API hoạt động tốt",
                    "test_result": {
                        "distance": leg['distance']['text'],
                        "duration": leg['duration']['text'],
                        "start_address": leg['start_address'],
                        "end_address": leg['end_address']
                    }
                }
            else:
                return {
                    "status": "no_results",
                    "message": "Google Maps API không trả về kết quả"
                }
                
        except googlemaps.exceptions.ApiError as e:
            return {
                "status": "api_error",
                "message": f"Google Maps API Error: {str(e)}",
                "error_type": "ApiError"
            }
        except googlemaps.exceptions.HTTPError as e:
            return {
                "status": "http_error", 
                "message": f"Google Maps HTTP Error: {str(e)}",
                "error_type": "HTTPError"
            }
        except Exception as e:
            return {
                "status": "unknown_error",
                "message": f"Lỗi không xác định: {str(e)}",
                "error_type": type(e).__name__
            }
            
    except ImportError:
        return {
            "status": "import_error",
            "message": "Chưa cài đặt googlemaps library"
        }
    except Exception as e:
        return {
            "status": "general_error", 
            "message": f"Lỗi chung: {str(e)}"
        }

# ================== API SETTINGS MANAGEMENT ==================

@router.get("/settings/{key}")
async def get_setting(key: str, db: Session = Depends(get_db)):
    """Lấy giá trị setting theo key"""
    try:
        setting = db.query(models.Settings).filter(models.Settings.key == key).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting không tồn tại")
        return {
            "key": setting.key, 
            "value": setting.value, 
            "description": setting.description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy setting: {str(e)}")

@router.post("/settings")
async def update_setting(
    key: str,
    value: str,
    description: str = "",
    db: Session = Depends(get_db)
):
    """Cập nhật hoặc tạo mới setting"""
    try:
        # Tìm setting hiện tại
        setting = db.query(models.Settings).filter(models.Settings.key == key).first()
        
        if setting:
            # Update existing
            setting.value = value
            if description:
                setting.description = description
            setting.updated_at = datetime.now()
        else:
            # Create new
            setting = models.Settings(
                key=key,
                value=value,
                description=description,
                updated_at=datetime.now()
            )
            db.add(setting)
        
        db.commit()
        db.refresh(setting)
        
        return {
            "message": "Cập nhật setting thành công", 
            "setting": {
                "key": setting.key,
                "value": setting.value,
                "description": setting.description,
                "updated_at": setting.updated_at.isoformat() if setting.updated_at else None
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật setting: {str(e)}")

@router.get("/settings")
async def get_all_settings(db: Session = Depends(get_db)):
    """Lấy tất cả settings"""
    try:
        settings = db.query(models.Settings).all()
        return [
            {
                "key": s.key, 
                "value": s.value, 
                "description": s.description,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None
            } 
            for s in settings
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy settings: {str(e)}")

# API health check
@router.get("/health")
async def health_check():
    """Kiểm tra sức khỏe của API"""
    return {
        "status": "healthy",
        "message": "Travel Price Calculator API is running!",
        "timestamp": datetime.now().isoformat()
    }