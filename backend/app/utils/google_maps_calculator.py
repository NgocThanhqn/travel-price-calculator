# backend/app/utils/google_maps_calculator.py - FIXED VERSION

import googlemaps
import math
from typing import Dict, Tuple, Optional
from app.database.database import SessionLocal
from app.models import models

class GoogleMapsDistanceCalculator:
    def __init__(self, api_key: str = None):
        """
        Khởi tạo Google Maps client với fallback mechanism
        """
        if not api_key:
            api_key = self._get_api_key_from_db()
        
        if api_key and api_key != "YOUR_API_KEY_HERE":
            try:
                self.gmaps = googlemaps.Client(key=api_key)
                self.has_api_key = True
                print("✅ Google Maps client initialized successfully")
            except Exception as e:
                print(f"❌ Lỗi khởi tạo Google Maps client: {e}")
                self.gmaps = None
                self.has_api_key = False
        else:
            self.gmaps = None
            self.has_api_key = False
            print("⚠️ No Google Maps API key found")
    
    def _get_api_key_from_db(self) -> Optional[str]:
        """Lấy API key từ database"""
        try:
            db = SessionLocal()
            setting = db.query(models.Settings).filter(
                models.Settings.key == "google_maps_api_key"
            ).first()
            db.close()
            
            if setting and setting.value and setting.value != "YOUR_API_KEY_HERE":
                return setting.value
            return None
        except Exception as e:
            print(f"Lỗi lấy API key từ database: {e}")
            return None
    
    def calculate_driving_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> Dict:
        """
        Tính khoảng cách và thời gian lái xe - Google Maps với fallback
        """
        # Thử Google Maps trước
        if self.has_api_key and self.gmaps:
            try:
                return self._google_maps_calculation(lat1, lng1, lat2, lng2)
            except Exception as e:
                print(f"❌ Google Maps failed, fallback to Haversine: {e}")
        
        # Fallback về Haversine khi Google Maps không có hoặc lỗi
        return self._haversine_calculation(lat1, lng1, lat2, lng2)
    
    def _google_maps_calculation(self, lat1: float, lng1: float, lat2: float, lng2: float) -> Dict:
        """
        Tính toán sử dụng Google Maps Directions API
        """
        print(f"🗺️ Using Google Maps for: ({lat1}, {lng1}) -> ({lat2}, {lng2})")
        
        try:
            # Gọi Google Maps Directions API
            directions_result = self.gmaps.directions(
                origin=(lat1, lng1),
                destination=(lat2, lng2),
                mode="driving",
                avoid=["tolls"],  # Tránh đường thu phí
                language="vi",
                region="vn"
            )
            
            if not directions_result or len(directions_result) == 0:
                raise Exception("No route found")
            
            route = directions_result[0]
            leg = route['legs'][0]
            
            # Lấy thông tin từ Google Maps
            distance_km = leg['distance']['value'] / 1000  # m -> km
            duration_minutes = leg['duration']['value'] / 60  # s -> phút
            
            # Lấy địa chỉ chi tiết
            start_address = leg['start_address']
            end_address = leg['end_address']
            
            # Lấy polyline để vẽ đường đi
            polyline = route['overview_polyline']['points']
            
            return {
                "distance_km": round(distance_km, 2),
                "duration_minutes": round(duration_minutes, 1),
                "start_address": start_address,
                "end_address": end_address,
                "polyline": polyline,
                "method": "google_maps",
                "success": True,
                "route_info": {
                    "summary": route.get('summary', ''),
                    "warnings": route.get('warnings', []),
                    "distance_text": leg['distance']['text'],
                    "duration_text": leg['duration']['text'],
                    "steps_count": len(leg['steps'])
                }
            }
            
        except googlemaps.exceptions.ApiError as e:
            raise Exception(f"Google Maps API Error: {str(e)}")
        except googlemaps.exceptions.HTTPError as e:
            raise Exception(f"Google Maps HTTP Error: {str(e)}")
        except Exception as e:
            raise Exception(f"Google Maps Error: {str(e)}")
    
    def _haversine_calculation(self, lat1: float, lng1: float, lat2: float, lng2: float) -> Dict:
        """
        Fallback: Tính khoảng cách theo công thức Haversine (điều chỉnh thực tế)
        """
        print(f"🧮 Using Haversine calculation (fallback)")
        
        # Chuyển độ sang radian
        lat1_rad, lng1_rad, lat2_rad, lng2_rad = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Công thức Haversine
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Bán kính trái đất (km)
        earth_radius = 6371
        straight_distance = earth_radius * c
        
        # Điều chỉnh để gần với khoảng cách đường đi thực tế
        # Trong thành phố: +40%, ngoại ô: +25%
        if straight_distance < 10:  # Trong thành phố
            distance_adjusted = straight_distance * 1.4
            avg_speed = 25  # km/h
        elif straight_distance < 50:  # Ngoại ô
            distance_adjusted = straight_distance * 1.25
            avg_speed = 40  # km/h
        else:  # Liên tỉnh
            distance_adjusted = straight_distance * 1.15
            avg_speed = 60  # km/h
        
        # Tính thời gian ước tính
        estimated_duration = (distance_adjusted / avg_speed) * 60
        
        return {
            "distance_km": round(distance_adjusted, 2),
            "duration_minutes": round(estimated_duration, 1),
            "start_address": f"Vị trí ({lat1:.4f}, {lng1:.4f})",
            "end_address": f"Vị trí ({lat2:.4f}, {lng2:.4f})",
            "polyline": None,
            "method": "haversine_adjusted",
            "success": True,
            "route_info": {
                "summary": f"Khoảng cách ước tính (hệ số x{distance_adjusted/straight_distance:.2f})",
                "warnings": ["Đây là khoảng cách ước tính, không phải đường đi thực tế"],
                "distance_text": f"{round(distance_adjusted, 2)} km (ước tính)",
                "duration_text": f"~{round(estimated_duration)} phút",
                "original_distance": round(straight_distance, 2)
            }
        }
    
    def test_connection(self) -> Dict:
        """
        Test kết nối Google Maps API - FIXED VERSION
        """
        if not self.has_api_key:
            return {
                "status": "no_api_key",
                "message": "Chưa cấu hình Google Maps API key",
                "success": False
            }
        
        try:
            # Test với 2 điểm ở HCM - sử dụng method chính
            result = self.calculate_driving_distance(
                10.762622, 106.660172,  # Quận 1
                10.732599, 106.719749   # Quận 7
            )
            
            if result.get("method") == "google_maps":
                return {
                    "status": "success",
                    "message": "Google Maps API hoạt động tốt",
                    "success": True,
                    "test_result": {
                        "distance": result["distance_km"],
                        "duration": result["duration_minutes"],
                        "method": result["method"],
                        "from_address": result.get("start_address", ""),
                        "to_address": result.get("end_address", "")
                    }
                }
            else:
                return {
                    "status": "fallback_used",
                    "message": "Google Maps không hoạt động, đã sử dụng fallback",
                    "success": False,
                    "will_use_fallback": True,
                    "test_result": {
                        "distance": result["distance_km"],
                        "duration": result["duration_minutes"], 
                        "method": result["method"]
                    }
                }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Lỗi test Google Maps: {str(e)}",
                "success": False,
                "will_use_fallback": True
            }