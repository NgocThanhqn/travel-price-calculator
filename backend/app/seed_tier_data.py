# backend/app/seed_tier_data.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import TierPriceConfigModel, PriceConfig
from database.database import DATABASE_URL

def seed_data():
    """Tạo dữ liệu mẫu cho tier pricing"""
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("🌱 Bắt đầu tạo dữ liệu mẫu...")
        
        # Xóa dữ liệu cũ nếu có
        print("🗑️ Xóa dữ liệu cũ...")
        db.query(TierPriceConfigModel).delete()
        
        # Cấu hình mẫu 1: Tiêu chuẩn
        print("📝 Tạo cấu hình standard...")
        standard_config = TierPriceConfigModel(
            name="standard",
            base_price=10000.0,
            tiers=[
                {
                    "from_km": 0,
                    "to_km": 10,
                    "price_per_km": 15000,
                    "description": "0-10km: 15,000 VNĐ/km (Gần)"
                },
                {
                    "from_km": 10,
                    "to_km": 50,
                    "price_per_km": 12000,
                    "description": "10-50km: 12,000 VNĐ/km (Trung bình)"
                },
                {
                    "from_km": 50,
                    "to_km": None,
                    "price_per_km": 8000,
                    "description": "Trên 50km: 8,000 VNĐ/km (Xa)"
                }
            ]
        )
        
        # Cấu hình mẫu 2: Cuối tuần
        print("📝 Tạo cấu hình weekend...")
        weekend_config = TierPriceConfigModel(
            name="weekend",
            base_price=15000.0,
            tiers=[
                {
                    "from_km": 0,
                    "to_km": 10,
                    "price_per_km": 18000,
                    "description": "0-10km: 18,000 VNĐ/km (Cuối tuần)"
                },
                {
                    "from_km": 10,
                    "to_km": 30,
                    "price_per_km": 15000,
                    "description": "10-30km: 15,000 VNĐ/km (Cuối tuần)"
                },
                {
                    "from_km": 30,
                    "to_km": None,
                    "price_per_km": 10000,
                    "description": "Trên 30km: 10,000 VNĐ/km (Cuối tuần)"
                }
            ]
        )
        
        # Cấu hình mẫu 3: VIP
        print("📝 Tạo cấu hình vip...")
        vip_config = TierPriceConfigModel(
            name="vip",
            base_price=20000.0,
            tiers=[
                {
                    "from_km": 0,
                    "to_km": 5,
                    "price_per_km": 20000,
                    "description": "0-5km: 20,000 VNĐ/km (VIP - Siêu gần)"
                },
                {
                    "from_km": 5,
                    "to_km": 15,
                    "price_per_km": 17000,
                    "description": "5-15km: 17,000 VNĐ/km (VIP - Gần)"
                },
                {
                    "from_km": 15,
                    "to_km": 40,
                    "price_per_km": 14000,
                    "description": "15-40km: 14,000 VNĐ/km (VIP - Trung)"
                },
                {
                    "from_km": 40,
                    "to_km": None,
                    "price_per_km": 11000,
                    "description": "Trên 40km: 11,000 VNĐ/km (VIP - Xa)"
                }
            ]
        )
        
        # Thêm vào database
        db.add(standard_config)
        db.add(weekend_config)  
        db.add(vip_config)
        
        # Thêm cấu hình giá đơn giản mặc định
        print("📝 Kiểm tra cấu hình giá đơn giản...")
        try:
            # Kiểm tra có bản ghi nào trong price_configs không
            existing_count = db.query(PriceConfig).count()
            if existing_count == 0:
                print("📝 Tạo cấu hình giá đơn giản mặc định...")
                simple_config = PriceConfig(
                    name="default",
                    base_price=10000.0,
                    price_per_km=5000.0,
                    min_price=20000.0,
                    max_price=500000.0
                )
                db.add(simple_config)
            else:
                print(f"✅ Đã có {existing_count} cấu hình giá đơn giản")
        except Exception as e:
            print(f"⚠️ Lỗi kiểm tra price_configs: {e}")
        
        # Commit tất cả
        print("💾 Lưu vào database...")
        db.commit()
        
        print("✅ Đã tạo dữ liệu mẫu thành công!")
        print("\n📋 Các cấu hình tier pricing đã tạo:")
        print("1. 🟢 standard - Giá tiêu chuẩn")
        print("   • 0-10km: 15,000 VNĐ/km")
        print("   • 10-50km: 12,000 VNĐ/km")
        print("   • 50km+: 8,000 VNĐ/km")
        print("   • Khởi điểm: 10,000 VNĐ")
        
        print("\n2. 🟡 weekend - Giá cuối tuần")
        print("   • 0-10km: 18,000 VNĐ/km")
        print("   • 10-30km: 15,000 VNĐ/km")
        print("   • 30km+: 10,000 VNĐ/km")
        print("   • Khởi điểm: 15,000 VNĐ")
        
        print("\n3. 🔴 vip - Giá VIP")
        print("   • 0-5km: 20,000 VNĐ/km")
        print("   • 5-15km: 17,000 VNĐ/km")
        print("   • 15-40km: 14,000 VNĐ/km")
        print("   • 40km+: 11,000 VNĐ/km")
        print("   • Khởi điểm: 20,000 VNĐ")
        
        # Test tính giá ví dụ
        print("\n🧮 Ví dụ tính giá cho chuyến đi 25km:")
        print("📊 Standard: 10,000 + (10×15,000) + (15×12,000) = 340,000 VNĐ")
        print("📊 Weekend: 15,000 + (10×18,000) + (15×15,000) = 420,000 VNĐ")
        print("📊 VIP: 20,000 + (5×20,000) + (10×17,000) + (10×14,000) = 430,000 VNĐ")
        
        # Kiểm tra số lượng records đã tạo
        tier_count = db.query(TierPriceConfigModel).count()
        simple_count = db.query(PriceConfig).count()
        print(f"\n📈 Tổng kết:")
        print(f"   • Tier configs: {tier_count} bản ghi")
        print(f"   • Simple configs: {simple_count} bản ghi")
        
    except Exception as e:
        print(f"❌ Lỗi tạo dữ liệu: {e}")
        print(f"📍 Chi tiết lỗi: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()