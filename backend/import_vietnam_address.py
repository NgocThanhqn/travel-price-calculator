#!/usr/bin/env python3
"""
Script import dữ liệu tỉnh/huyện/xã từ district_ward.txt vào SQLite database
Sử dụng: python import_vietnam_address.py district_ward.txt
"""

import json
import sqlite3
import sys
import os
from datetime import datetime

def create_address_tables(cursor):
    """Tạo các bảng address nếu chưa có"""
    
    # Tỉnh/Thành phố
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS provinces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            name_en VARCHAR(255),
            full_name VARCHAR(255),
            latitude DECIMAL(10, 7),
            longitude DECIMAL(10, 7),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Quận/Huyện
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS districts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            name_en VARCHAR(255),
            full_name VARCHAR(255),
            province_code VARCHAR(10) NOT NULL,
            latitude DECIMAL(10, 7),
            longitude DECIMAL(10, 7),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (province_code) REFERENCES provinces(code)
        )
    ''')
    
    # Phường/Xã/Thị trấn  
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            name_en VARCHAR(255),
            full_name VARCHAR(255),
            district_code VARCHAR(10) NOT NULL,
            province_code VARCHAR(10) NOT NULL,
            division_type VARCHAR(50),
            latitude DECIMAL(10, 7),
            longitude DECIMAL(10, 7),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (district_code) REFERENCES districts(code),
            FOREIGN KEY (province_code) REFERENCES provinces(code)
        )
    ''')
    
    # Tạo indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_province_code ON provinces(code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_province_name ON provinces(name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_district_code ON districts(code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_district_province ON districts(province_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ward_code ON wards(code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ward_district ON wards(district_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ward_province ON wards(province_code)')

def import_district_ward_format(cursor, json_data):
    """
    Import từ format district_ward.txt:
    [
      {
        "name": "Thành phố Hà Nội",
        "code": 1,
        "codename": "thanh_pho_ha_noi",
        "division_type": "thành phố trung ương",
        "phone_code": 24,
        "districts": [
          {
            "name": "Quận Ba Đình",
            "code": 1,
            "codename": "quan_ba_dinh", 
            "division_type": "quận",
            "short_codename": "ba_dinh",
            "wards": [
              {
                "name": "Phường Phúc Xá",
                "code": 1,
                "codename": "phuong_phuc_xa",
                "division_type": "phường",
                "short_codename": "phuc_xa"
              }
            ]
          }
        ]
      }
    ]
    """
    
    provinces_count = 0
    districts_count = 0
    wards_count = 0
    
    for province_data in json_data:
        try:
            province_code = str(province_data.get('code'))
            province_name = province_data.get('name', '')
            
            # Insert province
            cursor.execute('''
                INSERT OR REPLACE INTO provinces (code, name, full_name)
                VALUES (?, ?, ?)
            ''', (
                province_code,
                province_name,
                province_name  # full_name = name for now
            ))
            provinces_count += 1
            
            print(f"✅ Province: {province_name} (code: {province_code})")
            
            # Process districts
            for district_data in province_data.get('districts', []):
                try:
                    district_code = str(district_data.get('code'))
                    district_name = district_data.get('name', '')
                    
                    # Insert district
                    cursor.execute('''
                        INSERT OR REPLACE INTO districts (code, name, full_name, province_code)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        district_code,
                        district_name,
                        district_name,  # full_name = name for now
                        province_code
                    ))
                    districts_count += 1
                    
                    # Process wards
                    for ward_data in district_data.get('wards', []):
                        try:
                            ward_code = str(ward_data.get('code'))
                            ward_name = ward_data.get('name', '')
                            division_type = ward_data.get('division_type', '')
                            
                            # Insert ward
                            cursor.execute('''
                                INSERT OR REPLACE INTO wards (code, name, full_name, district_code, province_code, division_type)
                                VALUES (?, ?, ?, ?, ?, ?)
                            ''', (
                                ward_code,
                                ward_name,
                                ward_name,  # full_name = name for now
                                district_code,
                                province_code,
                                division_type
                            ))
                            wards_count += 1
                            
                        except Exception as e:
                            print(f"❌ Lỗi import ward {ward_data.get('name', 'Unknown')}: {e}")
                            
                except Exception as e:
                    print(f"❌ Lỗi import district {district_data.get('name', 'Unknown')}: {e}")
                    
        except Exception as e:
            print(f"❌ Lỗi import province {province_data.get('name', 'Unknown')}: {e}")
    
    return provinces_count, districts_count, wards_count

def main():
    if len(sys.argv) != 2:
        print("❌ Sử dụng: python import_vietnam_address.py <path_to_district_ward.txt>")
        print("   Ví dụ: python import_vietnam_address.py district_ward.txt")
        sys.exit(1)
    
    json_file = sys.argv[1]
    db_path = '/var/www/travel-booking/database/travel_calculator.db'
    #db_path = 'database/travel_calculator.db'
    
    # Kiểm tra file JSON
    if not os.path.exists(json_file):
        print(f"❌ Không tìm thấy file: {json_file}")
        sys.exit(1)
    
    # Kiểm tra database
    if not os.path.exists(db_path):
        print(f"❌ Không tìm thấy database: {db_path}")
        print("   Hãy chạy backend trước để tạo database")
        sys.exit(1)
    
    print(f"📂 Đang đọc file: {json_file}")
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file JSON: {e}")
        sys.exit(1)
    
    # Kiểm tra format dữ liệu
    if not isinstance(json_data, list):
        print("❌ Format dữ liệu không đúng. Cần là array của provinces")
        sys.exit(1)
    
    if len(json_data) == 0:
        print("❌ File dữ liệu trống")
        sys.exit(1)
    
    # Kiểm tra sample data
    sample = json_data[0]
    if not all(key in sample for key in ['name', 'code', 'districts']):
        print("❌ Format dữ liệu không đúng. Thiếu các field: name, code, districts")
        sys.exit(1)
    
    print(f"📊 Tìm thấy {len(json_data)} tỉnh/thành phố trong file")
    print(f"🗄️ Kết nối database: {db_path}")
    
    # Kết nối database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔧 Tạo bảng address...")
        create_address_tables(cursor)
        
        print("📥 Bắt đầu import dữ liệu...")
        
        # Import dữ liệu
        provinces_count, districts_count, wards_count = import_district_ward_format(cursor, json_data)
        
        conn.commit()
        
        print("\n" + "="*50)
        print("✅ IMPORT THÀNH CÔNG!")
        print(f"   📍 Tỉnh/TP: {provinces_count}")
        print(f"   🏘️ Quận/Huyện: {districts_count}")  
        print(f"   🏠 Phường/Xã: {wards_count}")
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM provinces")
        total_provinces = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM districts") 
        total_districts = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM wards")
        total_wards = cursor.fetchone()[0]
        
        print(f"\n📊 Tổng trong database:")
        print(f"   📍 Tỉnh/TP: {total_provinces}")
        print(f"   🏘️ Quận/Huyện: {total_districts}")
        print(f"   🏠 Phường/Xã: {total_wards}")
        
        # Hiển thị sample data
        print(f"\n🔍 Sample dữ liệu:")
        cursor.execute("SELECT name FROM provinces LIMIT 5")
        provinces_sample = cursor.fetchall()
        for p in provinces_sample:
            print(f"   • {p[0]}")
        
        print(f"\n🎉 Hoàn thành! Bạn có thể sử dụng AddressSelector component.")
        
    except Exception as e:
        print(f"❌ Lỗi import: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()