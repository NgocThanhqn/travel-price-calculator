from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.schemas import TierPriceConfig, TierPriceConfigCreate
from app.crud.tier_pricing import TierPricingCRUD
from app.utils.tier_price_calculator import TierPriceCalculator
from typing import List

router = APIRouter()
tier_crud = TierPricingCRUD()

@router.post("/tier-configs", response_model=TierPriceConfig)
async def create_tier_config(
    config: TierPriceConfigCreate,
    db: Session = Depends(get_db)
):
    """Tạo cấu hình giá theo bậc"""
    try:
        db_config = tier_crud.create_config(db, config)
        
        # Convert back to response model
        tiers = [PriceTier(**tier) for tier in db_config.tiers]
        return TierPriceConfig(
            id=db_config.id,
            name=db_config.name,
            base_price=db_config.base_price,
            tiers=tiers,
            is_active=db_config.is_active,
            created_at=str(db_config.created_at),
            updated_at=str(db_config.updated_at)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tier-configs", response_model=List[TierPriceConfig])
async def get_tier_configs(db: Session = Depends(get_db)):
    """Lấy tất cả cấu hình giá theo bậc"""
    configs = tier_crud.get_all_configs(db)
    result = []
    
    for config in configs:
        tiers = [PriceTier(**tier) for tier in config.tiers]
        result.append(TierPriceConfig(
            id=config.id,
            name=config.name,
            base_price=config.base_price,
            tiers=tiers,
            is_active=config.is_active,
            created_at=str(config.created_at),
            updated_at=str(config.updated_at)
        ))
    
    return result

@router.get("/tier-configs/{config_name}", response_model=TierPriceConfig)
async def get_tier_config(config_name: str, db: Session = Depends(get_db)):
    """Lấy cấu hình theo tên"""
    config = tier_crud.get_config(db, config_name)
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    
    tiers = [PriceTier(**tier) for tier in config.tiers]
    return TierPriceConfig(
        id=config.id,
        name=config.name,
        base_price=config.base_price,
        tiers=tiers,
        is_active=config.is_active,
        created_at=str(config.created_at),
        updated_at=str(config.updated_at)
    )

@router.post("/calculate-tier-price")
async def calculate_tier_price(
    config_name: str,
    distance_km: float,
    db: Session = Depends(get_db)
):
    """Tính giá theo bậc"""
    config = tier_crud.get_config(db, config_name)
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    
    # Convert to schema
    tiers = [PriceTier(**tier) for tier in config.tiers]
    price_config = TierPriceConfig(
        id=config.id,
        name=config.name,
        base_price=config.base_price,
        tiers=tiers,
        is_active=config.is_active
    )
    
    calculator = TierPriceCalculator(price_config)
    result = calculator.calculate_price(distance_km)
    
    return result