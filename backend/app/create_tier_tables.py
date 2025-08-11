# backend/app/create_tier_tables.py

from sqlalchemy import create_engine
from models.models import Base, TierPriceConfigModel
from database.database import DATABASE_URL
import os

def create_tables():
    """Tạo bảng tier price configs"""
    try:
        # Tạo engine và tables
        engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        
        print("✅ Đã tạo tất cả bảng thành công!")
        print(f"📍 Database location: {DATABASE_URL}")
        print("📊 Các bảng đã tạo:")
        print("- price_configs (Cấu hình giá đơn giản)")
        print("- trips (Lịch sử chuyến đi)")
        print("- settings (Cài đặt hệ thống)")
        print("- tier_price_configs (Cấu hình giá theo bậc)")
        
    except Exception as e:
        print(f"❌ Lỗi tạo bảng: {e}")

if __name__ == "__main__":
    create_tables()