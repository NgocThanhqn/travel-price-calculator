import requests
import asyncio
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import json

class SmartGeocodingService:
    def __init__(self):
        self.google_maps_api_key = None
        self.cache = {}  # In-memory cache cho session
    
    def set_api_key(self, api_key: str):
        """Set Google Maps API key"""
        self.google_maps_api_key = api_key
    
    async def get_api_key_from_db(self, db: Session) -> Optional[str]:
        """Lấy Google Maps API key từ database"""
        try:
            query = text("SELECT value FROM settings WHERE key = 'google_maps_api_key'")
            result = db.execute(query).fetchone()
            if result and result[0] != 'YOUR_API_KEY_HERE':
                self.google_maps_api_key = result[0]
                return result[0]
        except Exception as e:
            print(f"⚠️ Could not get API key from database: {e}")
        return None
    
    def build_address_string(self, level: str, code: str, db: Session) -> str:
        """Xây dựng address string cho geocoding"""
        try:
            if level == "province":
                query = text("SELECT full_name, name FROM provinces WHERE code = :code")
            elif level == "district":
                query = text("""
                    SELECT d.full_name, d.name, p.full_name, p.name 
                    FROM districts d 
                    JOIN provinces p ON d.province_code = p.code 
                    WHERE d.code = :code
                """)
            elif level == "ward":
                query = text("""
                    SELECT w.full_name, w.name, d.full_name, d.name, p.full_name, p.name
                    FROM wards w 
                    JOIN districts d ON w.district_code = d.code
                    JOIN provinces p ON w.province_code = p.code 
                    WHERE w.code = :code
                """)
            else:
                return ""
            
            result = db.execute(query, {"code": code}).fetchone()
            if not result:
                return ""
            
            # Xây dựng address từ cấp nhỏ nhất lên lớn nhất
            address_parts = []
            
            if level == "province":
                address_parts.append(result[0] or result[1])  # full_name hoặc name
            elif level == "district":
                address_parts.append(result[0] or result[1])  # district
                address_parts.append(result[2] or result[3])  # province
            elif level == "ward":
                address_parts.append(result[0] or result[1])  # ward
                address_parts.append(result[2] or result[3])  # district
                address_parts.append(result[4] or result[5])  # province
            
            return ", ".join(address_parts) + ", Vietnam"
            
        except Exception as e:
            print(f"❌ Error building address string: {e}")
            return ""
    
    async def geocode_with_google_maps(self, address: str) -> Optional[Dict]:
        """Gọi Google Maps Geocoding API"""
        if not self.google_maps_api_key:
            print("❌ No Google Maps API key available")
            return None
        
        try:
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                'address': address,
                'key': self.google_maps_api_key,
                'region': 'vn',  # Ưu tiên kết quả ở Vietnam
                'language': 'vi'
            }
            
            print(f"🌍 Geocoding address: {address}")
            
            # Sử dụng requests để gọi API đồng bộ
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data['status'] == 'OK' and len(data['results']) > 0:
                location = data['results'][0]['geometry']['location']
                formatted_address = data['results'][0]['formatted_address']
                
                result = {
                    "latitude": location['lat'],
                    "longitude": location['lng'],
                    "formatted_address": formatted_address,
                    "source": "google_maps"
                }
                
                print(f"✅ Geocoded successfully: ({result['latitude']}, {result['longitude']})")
                return result
            else:
                print(f"❌ Geocoding failed: {data['status']}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Google Maps API request failed: {e}")
            return None
        except Exception as e:
            print(f"❌ Geocoding error: {e}")
            return None
    
    async def save_coordinates_to_db(
        self, 
        level: str, 
        code: str, 
        latitude: float, 
        longitude: float, 
        db: Session
    ) -> bool:
        """Lưu tọa độ vào database"""
        try:
            table_name = f"{level}s"  # provinces, districts, wards
            
            update_query = text(f"""
                UPDATE {table_name} 
                SET latitude = :lat, longitude = :lng
                WHERE code = :code
            """)
            
            db.execute(update_query, {
                "lat": latitude,
                "lng": longitude,
                "code": code
            })
            db.commit()
            
            print(f"✅ Saved coordinates for {level} {code}: ({latitude}, {longitude})")
            return True
            
        except Exception as e:
            print(f"❌ Failed to save coordinates: {e}")
            db.rollback()
            return False
    
    async def get_coordinates_from_cache_or_db(
        self, 
        level: str, 
        code: str, 
        db: Session
    ) -> Optional[Dict]:
        """Lấy tọa độ từ cache hoặc database"""
        
        # Kiểm tra in-memory cache trước
        cache_key = f"{level}:{code}"
        if cache_key in self.cache:
            print(f"🎯 Cache hit for {cache_key}")
            return self.cache[cache_key]
        
        # Kiểm tra database
        try:
            table_name = f"{level}s"
            query = text(f"""
                SELECT name, full_name, latitude, longitude 
                FROM {table_name} 
                WHERE code = :code
            """)
            
            result = db.execute(query, {"code": code}).fetchone()
            
            if result and result[2] is not None and result[3] is not None:
                coordinates = {
                    "latitude": float(result[2]),
                    "longitude": float(result[3]),
                    "name": result[0],
                    "full_name": result[1],
                    "source": "database"
                }
                
                # Lưu vào cache
                self.cache[cache_key] = coordinates
                print(f"💾 Database hit for {cache_key}")
                return coordinates
            
            print(f"❌ No coordinates found for {cache_key}")
            return None
            
        except Exception as e:
            print(f"❌ Error getting coordinates from DB: {e}")
            return None
    
    async def smart_geocode(
        self, 
        level: str, 
        code: str, 
        db: Session,
        force_refresh: bool = False
    ) -> Dict:
        """
        Smart geocoding workflow:
        1. Check cache/database first
        2. If not found, geocode with Google Maps
        3. Save result to database
        """
        
        # Bước 1: Kiểm tra cache/database nếu không force refresh
        if not force_refresh:
            cached_coords = await self.get_coordinates_from_cache_or_db(level, code, db)
            if cached_coords:
                return {
                    "success": True,
                    "source": cached_coords["source"],
                    "coordinates": cached_coords,
                    "from_cache": True
                }
        
        # Bước 2: Lấy API key
        if not self.google_maps_api_key:
            await self.get_api_key_from_db(db)
        
        if not self.google_maps_api_key:
            return {
                "success": False,
                "error": "No Google Maps API key available",
                "coordinates": None,
                "from_cache": False
            }
        
        # Bước 3: Xây dựng address string
        address = self.build_address_string(level, code, db)
        if not address:
            return {
                "success": False,
                "error": f"Could not build address for {level}:{code}",
                "coordinates": None,
                "from_cache": False
            }
        
        # Bước 4: Geocode với Google Maps
        geocoded = await self.geocode_with_google_maps(address)
        if not geocoded:
            return {
                "success": False,
                "error": "Google Maps geocoding failed",
                "coordinates": None,
                "from_cache": False
            }
        
        # Bước 5: Lưu vào database
        saved = await self.save_coordinates_to_db(
            level, code, 
            geocoded["latitude"], 
            geocoded["longitude"], 
            db
        )
        
        if saved:
            # Cập nhật cache
            cache_key = f"{level}:{code}"
            self.cache[cache_key] = {
                "latitude": geocoded["latitude"],
                "longitude": geocoded["longitude"],
                "source": "google_maps_cached"
            }
        
        return {
            "success": True,
            "source": "google_maps",
            "coordinates": geocoded,
            "from_cache": False,
            "saved_to_db": saved
        }

# Singleton instance
smart_geocoding_service = SmartGeocodingService()
geocoding_service = smart_geocoding_service  # Alias for compatibility