# backend/app/utils/price_calculator.py

import math
from typing import Dict, Optional
from app.models.schemas import TripCalculationRequest

# Import Google Maps calculator với error handling
try:
    from utils.google_maps_calculator import GoogleMapsDistanceCalculator
    GOOGLE_MAPS_AVAILABLE = True
except ImportError:
    GOOGLE_MAPS_AVAILABLE = False
    print("⚠️ Google Maps calculator không có sẵn, sử dụng Haversine")

class PriceCalculator:
    def __init__(self, base_price: float, price_per_km: float, min_price: float, max_price: float, use_google_maps: bool = True):
        self.base_price = base_price
        self.price_per_km = price_per_km
        self.min_price = min_price
        self.max_price = max_price
        
        # Khởi tạo Google Maps calculator nếu có thể
        self.google_maps_calculator = None
        if use_google_maps and GOOGLE_MAPS_AVAILABLE:
            try:
                self.google_maps_calculator = GoogleMapsDistanceCalculator()
                if self.google_maps_calculator.has_api_key:
                    print("✅ Google Maps calculator ready")
                else:
                    print("⚠️ Google Maps calculator initialized but no API key")
            except Exception as e:
                print(f"❌ Cannot initialize Google Maps calculator: {e}")
                self.google_maps_calculator = None
    
    def calculate_distance_and_duration(self, lat1: float, lng1: float, lat2: float, lng2: float) -> Dict:
        """
        Tính khoảng cách và thời gian - Smart calculation với fallback
        """
        print(f"🚀 Calculating distance: ({lat1}, {lng1}) -> ({lat2}, {lng2})")
        
        # Thử Google Maps trước nếu có
        if self.google_maps_calculator:
            try:
                result = self.google_maps_calculator.calculate_driving_distance(lat1, lng1, lat2, lng2)
                if result.get('success'):
                    print(f"✅ Google Maps success: {result['distance_km']} km in {result['duration_minutes']} min")
                    return result
            except Exception as e:
                print(f"❌ Google Maps error: {e}")
        
        # Fallback về Haversine calculation
        print("🔄 Fallback to enhanced Haversine calculation")
        return self._enhanced_haversine_calculation(lat1, lng1, lat2, lng2)
    
    def _enhanced_haversine_calculation(self, lat1: float, lng1: float, lat2: float, lng2: float) -> Dict:
        """
        Enhanced Haversine calculation với điều chỉnh thực tế cho Việt Nam
        """
        # Chuyển độ sang radian
        lat1_rad, lng1_rad, lat2_rad, lng2_rad = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Công thức Haversine
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Bán kính trái đất
        earth_radius = 6371
        straight_distance = earth_radius * c
        
        # Điều chỉnh theo địa hình Việt Nam
        if straight_distance < 5:  # Nội thành (TP.HCM, Hà Nội)
            distance_multiplier = 1.5  # Nhiều ngã tư, đường vòng
            avg_speed = 25  # km/h
            area_type = "nội thành"
        elif straight_distance < 15:  # Ngoại thành
            distance_multiplier = 1.35
            avg_speed = 35  # km/h
            area_type = "ngoại thành"
        elif straight_distance < 50:  # Liên quận/huyện
            distance_multiplier = 1.25
            avg_speed = 45  # km/h
            area_type = "liên quận"
        else:  # Liên tỉnh
            distance_multiplier = 1.15
            avg_speed = 55  # km/h
            area_type = "liên tỉnh"
        
        # Tính khoảng cách và thời gian thực tế
        adjusted_distance = straight_distance * distance_multiplier
        estimated_duration = (adjusted_distance / avg_speed) * 60
        
        return {
            "distance_km": round(adjusted_distance, 2),
            "duration_minutes": round(estimated_duration, 1),
            "start_address": f"Tọa độ {lat1:.4f}, {lng1:.4f}",
            "end_address": f"Tọa độ {lat2:.4f}, {lng2:.4f}",
            "polyline": None,
            "method": "enhanced_haversine",
            "success": True,
            "route_info": {
                "summary": f"Ước tính {area_type} (hệ số ×{distance_multiplier})",
                "warnings": ["Khoảng cách ước tính dựa trên đặc điểm giao thông Việt Nam"],
                "distance_text": f"{round(adjusted_distance, 2)} km",
                "duration_text": f"~{round(estimated_duration)} phút",
                "calculation_details": {
                    "straight_distance": round(straight_distance, 2),
                    "multiplier": distance_multiplier,
                    "avg_speed": avg_speed,
                    "area_type": area_type
                }
            }
        }
    
    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Compatibility method - chỉ trả về khoảng cách (để tương thích code cũ)
        """
        result = self.calculate_distance_and_duration(lat1, lng1, lat2, lng2)
        return result["distance_km"]
    
    def calculate_price(self, distance_km: float) -> Dict:
        """
        Tính giá dựa trên khoảng cách
        """
        # Tính giá cơ bản
        calculated_price = self.base_price + (distance_km * self.price_per_km)
        
        # Áp dụng giá min/max
        final_price = max(self.min_price, min(calculated_price, self.max_price))
        
        return {
            "base_price": self.base_price,
            "distance_km": distance_km,
            "price_per_km": self.price_per_km,
            "calculated_price": calculated_price,
            "final_price": final_price,
            "min_price": self.min_price,
            "max_price": self.max_price,
            "breakdown": {
                "base": self.base_price,
                "distance_cost": distance_km * self.price_per_km,
                "total_before_limits": calculated_price,
                "applied_min_max": final_price != calculated_price
            }
        }
    
    def calculate_trip(self, request: TripCalculationRequest) -> Dict:
        """
        Tính toán đầy đủ cho một chuyến đi với smart calculation
        """
        print(f"🎯 Calculating trip: {request.from_address} -> {request.to_address}")
        
        # Tính khoảng cách và thời gian với smart method
        distance_result = self.calculate_distance_and_duration(
            request.from_lat, request.from_lng,
            request.to_lat, request.to_lng
        )
        
        # Tính giá
        price_info = self.calculate_price(distance_result["distance_km"])
        
        # Kết hợp thông tin
        from_address = distance_result.get("start_address") or request.from_address or f"{request.from_lat}, {request.from_lng}"
        to_address = distance_result.get("end_address") or request.to_address or f"{request.to_lat}, {request.to_lng}"
        
        result = {
            "distance_km": distance_result["distance_km"],
            "duration_minutes": distance_result["duration_minutes"],
            "calculated_price": price_info["final_price"],
            "from_address": from_address,
            "to_address": to_address,
            "breakdown": price_info,
            "route_info": distance_result.get("route_info", {}),
            "calculation_method": distance_result.get("method", "unknown"),
            "polyline": distance_result.get("polyline"),
            "success": distance_result.get("success", True)
        }
        
        print(f"✅ Trip calculation complete: {result['distance_km']} km, {result['calculated_price']} VND")
        return result
    
    def get_calculation_status(self) -> Dict:
        """
        Lấy thông tin về khả năng tính toán hiện tại
        """
        return {
            "google_maps_available": GOOGLE_MAPS_AVAILABLE,
            "google_maps_ready": self.google_maps_calculator is not None and self.google_maps_calculator.has_api_key,
            "fallback_method": "enhanced_haversine",
            "status": "ready"
        }