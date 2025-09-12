from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from sqlalchemy import text
from pydantic import BaseModel
import asyncio
import logging

from app.database.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class SmartGeocodeRequest(BaseModel):
    level: str  # province, district, ward
    code: str
    full_address: Optional[str] = None
    force_refresh: bool = False

class CoordinateUpdateRequest(BaseModel):
    latitude: float
    longitude: float

@router.get("/test")
async def test_address(db: Session = Depends(get_db)):
    """Test endpoint để kiểm tra database connection"""
    try:
        # Test database connection
        db.execute(text("SELECT 1")) 
        return {"status": "success", "message": "Database connection OK"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/provinces")
async def get_provinces(
    include_coordinates: bool = Query(False, description="Include coordinate information"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tỉnh/thành phố với tùy chọn include coordinates"""
    try:
        if include_coordinates:
            # Enhanced query với coordinate info
            query = text("SELECT id, code, name, full_name, latitude, longitude FROM provinces ORDER BY name")
            result = db.execute(query).fetchall()
            
            provinces = []
            for row in result:
                province_data = {
                    "id": row[0],
                    "code": row[1],
                    "name": row[2], 
                    "full_name": row[3] or row[2],
                    "has_coordinates": row[4] is not None and row[5] is not None
                }
                
                # Chỉ include coordinates nếu có
                if row[4] is not None and row[5] is not None:
                    province_data["latitude"] = float(row[4])
                    province_data["longitude"] = float(row[5])
                
                provinces.append(province_data)
            
            # Calculate stats
            with_coords = sum(1 for p in provinces if p.get("has_coordinates", False))
            
            return {
                "provinces": provinces,
                "total": len(provinces),
                "with_coordinates": with_coords,
                "coordinate_coverage": round((with_coords / len(provinces) * 100) if len(provinces) > 0 else 0, 1)
            }
        else:
            # Original query without coordinates
            query = text("SELECT id, code, name, full_name FROM provinces ORDER BY name")
            result = db.execute(query).fetchall()
            
            provinces = []
            for row in result:
                provinces.append({
                    "id": row[0],
                    "code": row[1],
                    "name": row[2], 
                    "full_name": row[3] or row[2]
                })
            
            return {"provinces": provinces}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/districts/{province_code}")
async def get_districts(
    province_code: str, 
    include_coordinates: bool = Query(False, description="Include coordinate information"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách quận/huyện theo mã tỉnh với tùy chọn include coordinates"""
    try:
        if include_coordinates:
            # Enhanced query với coordinate info
            query = text("""
                SELECT id, code, name, full_name, latitude, longitude
                FROM districts 
                WHERE province_code = :province_code 
                ORDER BY name
            """)
            result = db.execute(query, {"province_code": province_code}).fetchall()
            
            districts = []
            for row in result:
                district_data = {
                    "id": row[0],
                    "code": row[1],
                    "name": row[2],
                    "full_name": row[3] or row[2],
                    "has_coordinates": row[4] is not None and row[5] is not None
                }
                
                # Chỉ include coordinates nếu có
                if row[4] is not None and row[5] is not None:
                    district_data["latitude"] = float(row[4])
                    district_data["longitude"] = float(row[5])
                
                districts.append(district_data)
            
            # Calculate stats
            with_coords = sum(1 for d in districts if d.get("has_coordinates", False))
            
            return {
                "districts": districts,
                "total": len(districts),
                "with_coordinates": with_coords,
                "coordinate_coverage": round((with_coords / len(districts) * 100) if len(districts) > 0 else 0, 1)
            }
        else:
            # Original query without coordinates
            query = text("""
                SELECT id, code, name, full_name 
                FROM districts 
                WHERE province_code = :province_code 
                ORDER BY name
            """)
            result = db.execute(query, {"province_code": province_code}).fetchall()
            
            districts = []
            for row in result:
                districts.append({
                    "id": row[0],
                    "code": row[1],
                    "name": row[2],
                    "full_name": row[3] or row[2]
                })
            
            return {"districts": districts}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wards/{district_code}")
async def get_wards(
    district_code: str, 
    include_coordinates: bool = Query(False, description="Include coordinate information"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách phường/xã theo mã quận/huyện với tùy chọn include coordinates"""
    try:
        if include_coordinates:
            # Enhanced query với coordinate info
            query = text("""
                SELECT id, code, name, full_name, division_type, latitude, longitude
                FROM wards 
                WHERE district_code = :district_code 
                ORDER BY name
            """)
            result = db.execute(query, {"district_code": district_code}).fetchall()
            
            wards = []
            for row in result:
                ward_data = {
                    "id": row[0],
                    "code": row[1],
                    "name": row[2],
                    "full_name": row[3] or row[2],
                    "division_type": row[4],
                    "has_coordinates": row[5] is not None and row[6] is not None
                }
                
                # Chỉ include coordinates nếu có
                if row[5] is not None and row[6] is not None:
                    ward_data["latitude"] = float(row[5])
                    ward_data["longitude"] = float(row[6])
                
                wards.append(ward_data)
            
            # Calculate stats
            with_coords = sum(1 for w in wards if w.get("has_coordinates", False))
            
            return {
                "wards": wards,
                "total": len(wards),
                "with_coordinates": with_coords,
                "coordinate_coverage": round((with_coords / len(wards) * 100) if len(wards) > 0 else 0, 1)
            }
        else:
            # Original query without coordinates
            query = text("""
                SELECT id, code, name, full_name, division_type
                FROM wards 
                WHERE district_code = :district_code 
                ORDER BY name
            """)
            result = db.execute(query, {"district_code": district_code}).fetchall()
            
            wards = []
            for row in result:
                wards.append({
                    "id": row[0],
                    "code": row[1],
                    "name": row[2],
                    "full_name": row[3] or row[2],
                    "division_type": row[4]
                })
            
            return {"wards": wards}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== CÁC ENDPOINTS KHÁC (GIỮ NGUYÊN) =====

@router.get("/search")
async def search_address(
    q: str = Query(..., min_length=2, description="Từ khóa tìm kiếm"),
    type: Optional[str] = Query("all", description="Loại: province, district, ward, all"),
    limit: int = Query(20, le=50, description="Số lượng kết quả tối đa"),
    db: Session = Depends(get_db)
):
    """Tìm kiếm địa chỉ theo từ khóa"""
    try:
        results = []
        search_term = f"%{q}%"
        
        if type in ["province", "all"]:
            # Tìm tỉnh
            query = text("""
                SELECT 'province' as type, code, name, full_name, NULL as parent_code, NULL as parent_name
                FROM provinces 
                WHERE name LIKE :search_term OR full_name LIKE :search_term
                ORDER BY name
                LIMIT :limit
            """)
            province_results = db.execute(query, {"search_term": search_term, "limit": limit}).fetchall()
            
            for row in province_results:
                results.append({
                    "type": row[0],
                    "code": row[1],
                    "name": row[2],
                    "full_name": row[3],
                    "display_name": row[3] or row[2]
                })
        
        if type in ["district", "all"]:
            # Tìm quận/huyện
            query = text("""
                SELECT 'district' as type, d.code, d.name, d.full_name, d.province_code, p.name as province_name
                FROM districts d
                JOIN provinces p ON d.province_code = p.code
                WHERE d.name LIKE :search_term OR d.full_name LIKE :search_term
                ORDER BY d.name
                LIMIT :limit
            """)
            district_results = db.execute(query, {"search_term": search_term, "limit": limit}).fetchall()
            
            for row in district_results:
                results.append({
                    "type": row[0],
                    "code": row[1], 
                    "name": row[2],
                    "full_name": row[3],
                    "parent_code": row[4],
                    "parent_name": row[5],
                    "display_name": f"{row[3] or row[2]}, {row[5]}"
                })
        
        if type in ["ward", "all"]:
            # Tìm phường/xã
            query = text("""
                SELECT 'ward' as type, w.code, w.name, w.full_name, w.district_code, d.name as district_name, p.name as province_name
                FROM wards w
                JOIN districts d ON w.district_code = d.code  
                JOIN provinces p ON w.province_code = p.code
                WHERE w.name LIKE :search_term OR w.full_name LIKE :search_term
                ORDER BY w.name
                LIMIT :limit
            """)
            ward_results = db.execute(query, {"search_term": search_term, "limit": limit}).fetchall()
            
            for row in ward_results:
                results.append({
                    "type": row[0],
                    "code": row[1],
                    "name": row[2], 
                    "full_name": row[3],
                    "district_code": row[4],
                    "district_name": row[5],
                    "province_name": row[6],
                    "display_name": f"{row[3] or row[2]}, {row[5]}, {row[6]}"
                })
        
        return {
            "query": q,
            "total": len(results),
            "results": results[:limit]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/full-address")
async def get_full_address(
    province_code: Optional[str] = None,
    district_code: Optional[str] = None, 
    ward_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lấy địa chỉ đầy đủ từ các mã"""
    try:
        if not any([province_code, district_code, ward_code]):
            raise HTTPException(status_code=400, detail="Cần ít nhất một mã địa chỉ")
        
        query = text("""
            SELECT 
                p.code as province_code, p.name as province_name, p.full_name as province_full_name,
                d.code as district_code, d.name as district_name, d.full_name as district_full_name,
                w.code as ward_code, w.name as ward_name, w.full_name as ward_full_name
            FROM provinces p
            LEFT JOIN districts d ON d.province_code = p.code AND (:district_code IS NULL OR d.code = :district_code)
            LEFT JOIN wards w ON w.district_code = d.code AND (:ward_code IS NULL OR w.code = :ward_code)
            WHERE (:province_code IS NULL OR p.code = :province_code)
            LIMIT 1
        """)
        
        result = db.execute(query, {
            "province_code": province_code,
            "district_code": district_code, 
            "ward_code": ward_code
        }).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ")
        
        # Build full address
        parts = []
        if result[8]:  # ward_full_name
            parts.append(result[8])
        if result[5]:  # district_full_name  
            parts.append(result[5])
        if result[2]:  # province_full_name
            parts.append(result[2])
        
        full_address = ", ".join(parts)
        
        return {
            "province": {
                "code": result[0],
                "name": result[1],
                "full_name": result[2]
            } if result[0] else None,
            "district": {
                "code": result[3],
                "name": result[4], 
                "full_name": result[5]
            } if result[3] else None,
            "ward": {
                "code": result[6],
                "name": result[7],
                "full_name": result[8]
            } if result[6] else None,
            "full_address": full_address
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_address_stats(db: Session = Depends(get_db)):
    """Thống kê dữ liệu địa chỉ"""
    try:
        stats = {}
        
        # Đếm provinces
        query = text("SELECT COUNT(*) FROM provinces")
        stats["provinces"] = db.execute(query).scalar()
        
        # Đếm districts
        query = text("SELECT COUNT(*) FROM districts") 
        stats["districts"] = db.execute(query).scalar()
        
        # Đếm wards
        query = text("SELECT COUNT(*) FROM wards")
        stats["wards"] = db.execute(query).scalar()
        
        # Top 5 tỉnh có nhiều quận/huyện nhất
        query = text("""
            SELECT p.name, COUNT(d.id) as district_count
            FROM provinces p
            LEFT JOIN districts d ON p.code = d.province_code
            GROUP BY p.code, p.name
            ORDER BY district_count DESC
            LIMIT 5
        """)
        top_provinces = db.execute(query).fetchall()
        stats["top_provinces_by_districts"] = [
            {"name": row[0], "district_count": row[1]} 
            for row in top_provinces
        ]
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== SMART COORDINATE ENDPOINTS =====

@router.post("/smart-geocode")
async def smart_geocode(request: SmartGeocodeRequest, db: Session = Depends(get_db)):
    """Smart geocoding: Ưu tiên database -> Google Maps -> Save to database"""
    try:
        # Validate level
        if request.level not in ['province', 'district', 'ward']:
            raise HTTPException(status_code=400, detail="level phải là province, district hoặc ward")
        
        table_name = f"{request.level}s"
        
        # Kiểm tra trong database trước (trừ khi force_refresh)
        if not request.force_refresh:
            query = text(f"""
                SELECT code, name, full_name, latitude, longitude 
                FROM {table_name} 
                WHERE code = :code
            """)
            result = db.execute(query, {"code": request.code}).fetchone()
            
            if result and result[3] is not None and result[4] is not None:
                # Có tọa độ rồi, trả về luôn
                logger.info(f"Sử dụng tọa độ từ database cho {request.level}:{request.code}")
                return {
                    "success": True,
                    "data": {
                        "latitude": float(result[3]),
                        "longitude": float(result[4]),
                        "address": request.full_address or result[2] or result[1],
                        "source": "database",
                        "from_cache": True
                    }
                }
        
        # Chưa có hoặc force_refresh -> gọi Google Maps
        if not request.full_address:
            # Tạo địa chỉ từ database
            query = text(f"SELECT name, full_name FROM {table_name} WHERE code = :code")
            result = db.execute(query, {"code": request.code}).fetchone()
            if not result:
                raise HTTPException(status_code=404, detail=f"Không tìm thấy {request.level} với code {request.code}")
            
            request.full_address = (result[1] or result[0]) + ", Việt Nam"
        
        # Import here to avoid circular import
        from app.services.geocoding_service import geocoding_service
        
        # Gọi Google Maps thông qua smart_geocode
        geocode_result = await geocoding_service.smart_geocode(
            level=request.level,
            code=request.code, 
            db=db,
            force_refresh=request.force_refresh
        )
        
        if geocode_result and geocode_result.get("success") and "coordinates" in geocode_result:
            coordinates = geocode_result["coordinates"]
            
            return {
                "success": True,
                "data": {
                    "latitude": coordinates['latitude'],
                    "longitude": coordinates['longitude'],
                    "address": request.full_address,
                    "source": geocode_result.get("source", "google_maps"),
                    "from_cache": geocode_result.get("from_cache", False)
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Không thể lấy tọa độ từ Google Maps")
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Lỗi smart_geocode: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/provinces/{code}/coordinates")
async def update_province_coordinates(
    code: str, 
    request: CoordinateUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Cập nhật tọa độ cho tỉnh"""
    return await _update_coordinates("province", code, request, db)

@router.patch("/districts/{code}/coordinates")
async def update_district_coordinates(
    code: str, 
    request: CoordinateUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Cập nhật tọa độ cho huyện"""
    return await _update_coordinates("district", code, request, db)

@router.patch("/wards/{code}/coordinates")
async def update_ward_coordinates(
    code: str, 
    request: CoordinateUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Cập nhật tọa độ cho xã"""
    return await _update_coordinates("ward", code, request, db)

async def _update_coordinates(level: str, code: str, request: CoordinateUpdateRequest, db: Session):
    """Helper function để cập nhật tọa độ"""
    try:
        table_name = f"{level}s"
        
        # Kiểm tra xem record có tồn tại không
        check_query = text(f"SELECT id FROM {table_name} WHERE code = :code")
        existing = db.execute(check_query, {"code": code}).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy {level} với code {code}")

        # Cập nhật tọa độ
        update_query = text(f"""
            UPDATE {table_name} 
            SET latitude = :latitude, longitude = :longitude 
            WHERE code = :code
        """)
        
        db.execute(update_query, {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "code": code
        })
        db.commit()

        logger.info(f"Cập nhật tọa độ cho {level} {code}: {request.latitude}, {request.longitude}")
        
        return {
            "success": True,
            "message": f"Đã cập nhật tọa độ cho {level} {code}",
            "coordinates": {
                "latitude": request.latitude,
                "longitude": request.longitude
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Lỗi cập nhật tọa độ {level}:{code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coordinates/stats")
async def get_coordinate_stats(db: Session = Depends(get_db)):
    """Thống kê tọa độ trong database"""
    try:
        stats = {}
        
        for level in ['province', 'district', 'ward']:
            table_name = f"{level}s"
            
            # Tổng số
            total_query = text(f"SELECT COUNT(*) FROM {table_name}")
            total = db.execute(total_query).scalar()
            
            # Có tọa độ
            with_coords_query = text(f"""
                SELECT COUNT(*) FROM {table_name} 
                WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            """)
            with_coords = db.execute(with_coords_query).scalar()
            
            stats[level] = {
                "total": total,
                "with_coordinates": with_coords,
                "missing": total - with_coords,
                "coverage_percent": round((with_coords / total * 100) if total > 0 else 0, 1)
            }
        
        return {
            "success": True,
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Lỗi get_coordinate_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coordinates/missing")
async def get_missing_coordinates(
    level: str = Query("province", description="Cấp: province, district, ward"),
    limit: int = Query(20, le=100, description="Số lượng tối đa"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách địa chỉ chưa có tọa độ"""
    try:
        if level not in ['province', 'district', 'ward']:
            raise HTTPException(status_code=400, detail="level phải là province, district hoặc ward")
        
        table_name = f"{level}s"
        
        query = text(f"""
            SELECT code, name, full_name 
            FROM {table_name} 
            WHERE latitude IS NULL OR longitude IS NULL
            ORDER BY name
            LIMIT :limit
        """)
        
        results = db.execute(query, {"limit": limit}).fetchall()
        
        missing_items = []
        for row in results:
            missing_items.append({
                "code": row[0],
                "name": row[1],
                "full_name": row[2] or row[1]
            })
        
        return {
            "success": True,
            "level": level,
            "count": len(missing_items),
            "data": missing_items
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lỗi get_missing_coordinates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))