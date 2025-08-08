from app.models.schemas import TierPriceConfig, PriceTier
from typing import Dict, List

class TierPriceCalculator:
    def __init__(self, config: TierPriceConfig):
        self.config = config
        # Sắp xếp tiers theo from_km
        self.sorted_tiers = sorted(config.tiers, key=lambda x: x.from_km)
    
    def calculate_price(self, distance_km: float) -> Dict:
        """Tính giá theo bậc khoảng cách"""
        total_price = self.config.base_price
        remaining_distance = distance_km
        price_breakdown = []
        
        for tier in self.sorted_tiers:
            if remaining_distance <= 0:
                break
            
            # Tính khoảng cách áp dụng cho tier này
            tier_distance = 0
            
            if distance_km >= tier.from_km:
                if tier.to_km is None:
                    # Tier không giới hạn
                    tier_distance = max(0, distance_km - tier.from_km)
                else:
                    # Tier có giới hạn
                    tier_start = tier.from_km
                    tier_end = tier.to_km
                    
                    if distance_km <= tier_end:
                        tier_distance = distance_km - tier_start
                    else:
                        tier_distance = tier_end - tier_start
                
                if tier_distance > 0:
                    tier_price = tier_distance * tier.price_per_km
                    total_price += tier_price
                    
                    price_breakdown.append({
                        "tier": f"{tier.from_km}-{tier.to_km or '∞'}km",
                        "distance": tier_distance,
                        "price_per_km": tier.price_per_km,
                        "tier_price": tier_price,
                        "description": tier.description or f"Bậc {tier.from_km}-{tier.to_km or '∞'}km"
                    })
        
        return {
            "distance_km": distance_km,
            "base_price": self.config.base_price,
            "total_price": round(total_price, 0),
            "price_breakdown": price_breakdown,
            "config_name": self.config.name
        }
