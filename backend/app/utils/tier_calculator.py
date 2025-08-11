from typing import Dict, List
from app.models.schemas import PriceTier

class TierPriceCalculator:
    def __init__(self, base_price: float, tiers: List[Dict]):
        self.base_price = base_price
        # Convert dict tiers to PriceTier objects và sắp xếp theo from_km
        self.tiers = []
        for tier_data in tiers:
            tier = PriceTier(**tier_data)
            self.tiers.append(tier)
        
        # Sắp xếp theo from_km để đảm bảo tính toán đúng
        self.tiers.sort(key=lambda x: x.from_km)
    
    def calculate_price(self, distance_km: float) -> Dict:
        """Tính giá theo bậc khoảng cách"""
        if distance_km <= 0:
            return {
                "distance_km": distance_km,
                "base_price": self.base_price,
                "total_price": self.base_price,
                "price_breakdown": [],
                "error": "Khoảng cách phải lớn hơn 0"
            }
        
        total_price = self.base_price
        price_breakdown = []
        remaining_distance = distance_km
        
        for tier in self.tiers:
            if remaining_distance <= 0:
                break
            
            # Tính khoảng cách áp dụng cho tier này
            tier_distance = 0
            
            if distance_km > tier.from_km:
                # Xác định khoảng cách cho tier này
                tier_start = tier.from_km
                tier_end = tier.to_km if tier.to_km is not None else distance_km
                
                # Tính khoảng cách thực tế trong tier này
                effective_start = max(tier_start, 0)
                effective_end = min(tier_end, distance_km)
                
                if effective_end > effective_start:
                    tier_distance = effective_end - effective_start
                    tier_price = tier_distance * tier.price_per_km
                    total_price += tier_price
                    
                    price_breakdown.append({
                        "tier": f"{tier.from_km}-{tier.to_km if tier.to_km else '∞'}km",
                        "from_km": tier.from_km,
                        "to_km": tier.to_km,
                        "distance": round(tier_distance, 2),
                        "price_per_km": tier.price_per_km,
                        "tier_price": round(tier_price, 0),
                        "description": tier.description or f"Bậc {tier.from_km}-{tier.to_km or '∞'}km"
                    })
        
        return {
            "distance_km": distance_km,
            "base_price": self.base_price,
            "total_price": round(total_price, 0),
            "price_breakdown": price_breakdown
        }
    
    def get_tier_info(self) -> List[Dict]:
        """Lấy thông tin các bậc giá"""
        return [
            {
                "from_km": tier.from_km,
                "to_km": tier.to_km,
                "price_per_km": tier.price_per_km,
                "description": tier.description
            }
            for tier in self.tiers
        ]