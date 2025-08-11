from sqlalchemy.orm import Session
from app.models.models import TierPriceConfigModel
from app.models.schemas import TierPriceConfigCreate, TierPriceConfigUpdate
from typing import List, Optional
import json

class TierPricingCRUD:
    
    def create_config(self, db: Session, config: TierPriceConfigCreate) -> TierPriceConfigModel:
        """Tạo cấu hình giá mới"""
        # Convert tiers to JSON
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
            TierPriceConfigModel.name == config_name,
            TierPriceConfigModel.is_active == True
        ).first()
    
    def get_all_configs(self, db: Session) -> List[TierPriceConfigModel]:
        """Lấy tất cả cấu hình active"""
        return db.query(TierPriceConfigModel).filter(
            TierPriceConfigModel.is_active == True
        ).all()
    
    def update_config(self, db: Session, config_name: str, config_update: TierPriceConfigUpdate) -> Optional[TierPriceConfigModel]:
        """Cập nhật cấu hình"""
        db_config = self.get_config(db, config_name)
        if not db_config:
            return None
        
        # Update fields
        if config_update.name is not None:
            db_config.name = config_update.name
        if config_update.base_price is not None:
            db_config.base_price = config_update.base_price
        if config_update.tiers is not None:
            tiers_json = [tier.dict() for tier in config_update.tiers]
            db_config.tiers = tiers_json
        if config_update.is_active is not None:
            db_config.is_active = config_update.is_active
        
        db.commit()
        db.refresh(db_config)
        return db_config
    
    def delete_config(self, db: Session, config_name: str) -> bool:
        """Xóa cấu hình (soft delete)"""
        db_config = self.get_config(db, config_name)
        if not db_config:
            return False
        
        db_config.is_active = False
        db.commit()
        return True
    def set_setting(self, db: Session, key: str, value: str, description: str = None):
        """Set hoặc update setting"""
        db_setting = self.get_setting(db, key)
        if db_setting:
            # Update existing
            db_setting.value = value
            if description:
                db_setting.description = description
        else:
            # Create new
            db_setting = models.Settings(
                key=key,
                value=value,
                description=description or f"Setting for {key}"
            )
            db.add(db_setting)
        
        db.commit()
        db.refresh(db_setting)
        return db_setting
# Tạo instance global
tier_pricing_crud = TierPricingCRUD()