from sqlalchemy.orm import Session
from app.models.models import TierPriceConfigModel
from app.models.schemas import TierPriceConfigCreate, TierPriceConfig
from typing import List, Optional
import json

class TierPricingCRUD:
    
    def create_config(self, db: Session, config: TierPriceConfigCreate) -> TierPriceConfigModel:
        """Tạo cấu hình giá mới"""
        tiers_json = [tier.dict() for tier in config.tiers]
        
        db_config = TierPriceConfigModel(
            name=config.name,
            base_price=config.base_price,
            tiers=tiers_json
        )
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config
    
    def get_config(self, db: Session, config_name: str) -> Optional[TierPriceConfigModel]:
        """Lấy cấu hình theo tên"""
        return db.query(TierPriceConfigModel).filter(
            TierPriceConfigModel.name == config_name
        ).first()
    
    def get_all_configs(self, db: Session) -> List[TierPriceConfigModel]:
        """Lấy tất cả cấu hình"""
        return db.query(TierPriceConfigModel).filter(
            TierPriceConfigModel.is_active == True
        ).all()
    
    def update_config(self, db: Session, config_name: str, config_update) -> Optional[TierPriceConfigModel]:
        """Cập nhật cấu hình"""
        db_config = self.get_config(db, config_name)
        if not db_config:
            return None
        
        if hasattr(config_update, 'tiers'):
            tiers_json = [tier.dict() for tier in config_update.tiers]
            db_config.tiers = tiers_json
        
        for field, value in config_update.dict(exclude={'tiers'}).items():
            if hasattr(db_config, field):
                setattr(db_config, field, value)
        
        db.commit()
        db.refresh(db_config)
        return db_config
