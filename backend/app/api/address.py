from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from sqlalchemy import text

from app.database.database import get_db

router = APIRouter()

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
async def get_provinces(db: Session = Depends(get_db)):
    """Lấy danh sách tỉnh/thành phố"""
    try:
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
async def get_districts(province_code: str, db: Session = Depends(get_db)):
    """Lấy danh sách quận/huyện theo mã tỉnh"""
    try:
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
async def get_wards(district_code: str, db: Session = Depends(get_db)):
    """Lấy danh sách phường/xã theo mã quận/huyện"""
    try:
        query = text("""
            SELECT id, code, name, full_name 
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
                "full_name": row[3] or row[2]
            })
        
        return {"wards": wards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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