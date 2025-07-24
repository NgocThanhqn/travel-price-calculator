import math
from typing import Dict, Tuple
from models.schemas import TripCalculationRequest, TripCalculationResponse

class PriceCalculator:
    def __init__(self, base_price: float, price_per_km: float, min_price: float, max_price: float):
        self.base_price = base_price
        self.price_per_km = price_per_km
        self.min_price = min_price
        self.max_price = max_price
    
    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Tính khoảng cách giữa 2 điểm theo công thức Haversine (km)
        """
        # Chuyển độ sang radian
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Công thức Haversine
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Bán kính trái đất (km)
        earth_radius = 6371
        distance = earth_radius * c
        
        return round(distance, 2)
    
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
        Tính toán đầy đủ cho một chuyến đi
        """
        # Tính khoảng cách
        distance = self.calculate_distance(
            request.from_lat, request.from_lng,
            request.to_lat, request.to_lng
        )
        
        # Tính giá
        price_info = self.calculate_price(distance)
        
        # Ước tính thời gian (giả sử tốc độ trung bình 40km/h)
        estimated_duration = (distance / 40) * 60  # phút
        
        return {
            "distance_km": distance,
            "duration_minutes": round(estimated_duration, 1),
            "calculated_price": price_info["final_price"],
            "from_address": request.from_address or f"{request.from_lat}, {request.from_lng}",
            "to_address": request.to_address or f"{request.to_lat}, {request.to_lng}",
            "breakdown": price_info
        }