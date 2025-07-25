import sys
import os

# Thêm đường dẫn để import các module
current_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(current_dir, 'app')
sys.path.insert(0, app_dir)

from database.database import engine, create_tables, DATABASE_PATH
from models.models import Base, Booking, Customer, Settings, PriceConfig
from sqlalchemy.orm import sessionmaker

def update_database():
    """Cập nhật database với bảng mới"""
    
    print(f"Cập nhật database tại: {DATABASE_PATH}")
    
    try:
        # Tạo các bảng mới
        Base.metadata.create_all(bind=engine)
        print("✓ Đã tạo/cập nhật các bảng database")
        
        # Thêm dữ liệu mặc định cho vehicle types
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Thêm vehicle types vào settings
        vehicle_types = [
            ("vehicle_type_4_seats", "Xe 4 chỗ|Phù hợp 1-3 khách|1.0|4", "Thông tin xe 4 chỗ"),
            ("vehicle_type_7_seats", "Xe 7 chỗ|Phù hợp 4-6 khách|1.2|7", "Thông tin xe 7 chỗ"),
            ("vehicle_type_16_seats", "Xe 16 chỗ|Phù hợp 7-15 khách|1.5|16", "Thông tin xe 16 chỗ"),
        ]
        
        for key, value, desc in vehicle_types:
            existing = db.query(Settings).filter(Settings.key == key).first()
            if not existing:
                setting = Settings(key=key, value=value, description=desc)
                db.add(setting)
        
        db.commit()
        db.close()
        
        print("✓ Đã thêm dữ liệu mặc định")
        
    except Exception as e:
        print(f"Lỗi cập nhật database: {e}")

if __name__ == "__main__":
    update_database()
    print("🎉 Cập nhật database hoàn tất!")