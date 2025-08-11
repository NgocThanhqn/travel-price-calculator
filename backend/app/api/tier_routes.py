from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.schemas import  (
    TierPriceConfig, TierPriceConfigCreate, TierPriceConfigUpdate,
    TierPriceCalculationRequest, PriceTier
)
from app.crud.tier_pricing import tier_pricing_crud
from app.utils.tier_calculator import TierPriceCalculator
from typing import List

router = APIRouter()

@router.post("/tier-configs", response_model=TierPriceConfig)
async def create_tier_config(
    config: TierPriceConfigCreate,
    db: Session = Depends(get_db)
):
    """Tạo cấu hình giá theo bậc"""
    try:
        # Kiểm tra tên đã tồn tại chưa
        existing = tier_pricing_crud.get_config(db, config.name)
        if existing:
            raise HTTPException(status_code=400, detail=f"Cấu hình '{config.name}' đã tồn tại")
        
        # Tạo mới
        db_config = tier_pricing_crud.create_config(db, config)
        
        # Convert response
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
        raise HTTPException(status_code=400, detail=f"Lỗi tạo cấu hình: {str(e)}")

@router.get("/tier-configs", response_model=List[TierPriceConfig])
async def get_tier_configs(db: Session = Depends(get_db)):
    """Lấy tất cả cấu hình giá theo bậc"""
    configs = tier_pricing_crud.get_all_configs(db)
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
    config = tier_pricing_crud.get_config(db, config_name)
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

@router.put("/tier-configs/{config_name}", response_model=TierPriceConfig)
async def update_tier_config(
    config_name: str,
    config_update: TierPriceConfigUpdate,
    db: Session = Depends(get_db)
):
    """Cập nhật cấu hình giá"""
    updated_config = tier_pricing_crud.update_config(db, config_name, config_update)
    if not updated_config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    
    tiers = [PriceTier(**tier) for tier in updated_config.tiers]
    return TierPriceConfig(
        id=updated_config.id,
        name=updated_config.name,
        base_price=updated_config.base_price,
        tiers=tiers,
        is_active=updated_config.is_active,
        created_at=str(updated_config.created_at),
        updated_at=str(updated_config.updated_at)
    )

@router.delete("/tier-configs/{config_name}")
async def delete_tier_config(config_name: str, db: Session = Depends(get_db)):
    """Xóa cấu hình giá"""
    success = tier_pricing_crud.delete_config(db, config_name)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    
    return {"message": f"Đã xóa cấu hình '{config_name}'"}

@router.post("/calculate-tier-price")
async def calculate_tier_price(
    request: TierPriceCalculationRequest,
    db: Session = Depends(get_db)
):
    """Tính giá theo bậc"""
    # Lấy cấu hình
    config = tier_pricing_crud.get_config(db, request.config_name)
    if not config:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy cấu hình '{request.config_name}'")
    
    # Tính giá
    calculator = TierPriceCalculator(config.base_price, config.tiers)
    result = calculator.calculate_price(request.distance_km)
    
    # Thêm thông tin cấu hình
    result["config_name"] = request.config_name
    
    return result

@router.get("/tier-configs/{config_name}/calculate")
async def calculate_tier_price_get(
    config_name: str,
    distance_km: float,
    db: Session = Depends(get_db)
):
    """Tính giá theo bậc (GET method)"""
    # Lấy cấu hình
    config = tier_pricing_crud.get_config(db, config_name)
    if not config:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy cấu hình '{config_name}'")
    
    # Tính giá
    calculator = TierPriceCalculator(config.base_price, config.tiers)
    result = calculator.calculate_price(distance_km)
    
    # Thêm thông tin cấu hình
    result["config_name"] = config_name
    
    return result