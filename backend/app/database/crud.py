from sqlalchemy.orm import Session
from app.models import models, schemas
from typing import List, Optional

# CRUD cho PriceConfig
class PriceConfigCRUD:
    def get_config(self, db: Session, config_name: str) -> Optional[models.PriceConfig]:
        return db.query(models.PriceConfig).filter(
            models.PriceConfig.config_name == config_name,
            models.PriceConfig.is_active == True
        ).first()
    
    def get_all_configs(self, db: Session) -> List[models.PriceConfig]:
        return db.query(models.PriceConfig).all()
    
    def create_config(self, db: Session, config: schemas.PriceConfigCreate) -> models.PriceConfig:
        db_config = models.PriceConfig(**config.dict())
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config
    
    def update_config(self, db: Session, config_name: str, config_update: schemas.PriceConfigUpdate) -> Optional[models.PriceConfig]:
        db_config = self.get_config(db, config_name)
        if db_config:
            update_data = config_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_config, field, value)
            db.commit()
            db.refresh(db_config)
        return db_config

# CRUD cho Trip
class TripCRUD:
    def create_trip(self, db: Session, trip_data: dict) -> models.Trip:
        db_trip = models.Trip(**trip_data)
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
        return db_trip
    
    def get_trips(self, db: Session, skip: int = 0, limit: int = 100) -> List[models.Trip]:
        return db.query(models.Trip).offset(skip).limit(limit).all()

# CRUD cho Settings
class SettingsCRUD:
    def get_setting(self, db: Session, key: str) -> Optional[models.Settings]:
        return db.query(models.Settings).filter(models.Settings.key == key).first()
    
    def update_setting(self, db: Session, key: str, value: str, description: str = "") -> models.Settings:
        db_setting = self.get_setting(db, key)
        if db_setting:
            db_setting.value = value
            if description:
                db_setting.description = description
        else:
            db_setting = models.Settings(key=key, value=value, description=description)
            db.add(db_setting)
        db.commit()
        db.refresh(db_setting)
        return db_setting
    
    def get_all_settings(self, db: Session) -> List[models.Settings]:
        return db.query(models.Settings).all()
        
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
# Tạo instances
price_config_crud = PriceConfigCRUD()
trip_crud = TripCRUD()
settings_crud = SettingsCRUD()