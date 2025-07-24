import sys
import os

# Thêm đường dẫn để import các module
current_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(current_dir, 'app')
sys.path.insert(0, app_dir)

from database.database import engine, create_tables, DATABASE_PATH
from models.models import Base, PriceConfig, Settings
from sqlalchemy.orm import sessionmaker

def init_database():
    """Khởi tạo database và data mẫu"""
    
    print(f"Tạo database tại: {DATABASE_PATH}")
    
    # Tạo tất cả tables
    try:
        create_tables()
        print("✓ Đã tạo các bảng database")
    except Exception as e:
        print(f"Lỗi khi tạo tables: {e}")
        return
    
    # Tạo session để thêm data mẫu
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Kiểm tra xem đã có data chưa
        existing_config = db.query(PriceConfig).filter(PriceConfig.config_name == "default").first()
        if not existing_config:
            # Thêm cấu hình giá mặc định
            default_config = PriceConfig(
                config_name="default",
                base_price=10000,
                price_per_km=5000,
                min_price=20000,
                max_price=500000,
                is_active=True
            )
            db.add(default_config)
            
            # Thêm cấu hình settings
            google_maps_setting = Settings(
                key="google_maps_api_key",
                value="YOUR_API_KEY_HERE",
                description="Google Maps API Key"
            )
            db.add(google_maps_setting)
            
            db.commit()
            print("✓ Đã thêm dữ liệu mẫu")
        else:
            print("✓ Database đã có dữ liệu")
            
    except Exception as e:
        print(f"Lỗi khi khởi tạo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    print("🎉 Khởi tạo database hoàn tất!")