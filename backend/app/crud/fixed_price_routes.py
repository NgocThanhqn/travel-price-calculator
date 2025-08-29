# backend/app/crud/fixed_price_routes.py

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from app.models import models
from app.models.schemas import FixedPriceRouteCreate, FixedPriceRouteUpdate

class FixedPriceRouteCRUD:
    """CRUD operations cho cấu hình giá cố định theo tuyến đường"""
    
    def create_route(self, db: Session, route_data: FixedPriceRouteCreate) -> models.FixedPriceRoute:
        """Tạo cấu hình giá cố định mới"""
        db_route = models.FixedPriceRoute(**route_data.dict())
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        return db_route
    
    def get_route(self, db: Session, route_id: int) -> Optional[models.FixedPriceRoute]:
        """Lấy cấu hình giá cố định theo ID"""
        return db.query(models.FixedPriceRoute).filter(models.FixedPriceRoute.id == route_id).first()
    
    def get_routes(self, db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.FixedPriceRoute]:
        """Lấy danh sách cấu hình giá cố định"""
        query = db.query(models.FixedPriceRoute)
        if active_only:
            query = query.filter(models.FixedPriceRoute.is_active == True)
        return query.order_by(models.FixedPriceRoute.created_at.desc()).offset(skip).limit(limit).all()
    
    def update_route(self, db: Session, route_id: int, route_update: FixedPriceRouteUpdate) -> Optional[models.FixedPriceRoute]:
        """Cập nhật cấu hình giá cố định"""
        db_route = self.get_route(db, route_id)
        if not db_route:
            return None
        
        update_data = route_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_route, field, value)
        
        db.commit()
        db.refresh(db_route)
        return db_route
    
    def delete_route(self, db: Session, route_id: int) -> bool:
        """Xóa cấu hình giá cố định (soft delete)"""
        db_route = self.get_route(db, route_id)
        if not db_route:
            return False
        
        db_route.is_active = False
        db.commit()
        return True
    
    def find_matching_route(self, db: Session, from_province_id: int, to_province_id: int, 
                           from_district_id: Optional[int] = None, to_district_id: Optional[int] = None,
                           from_ward_id: Optional[int] = None, to_ward_id: Optional[int] = None) -> Optional[models.FixedPriceRoute]:
        """
        Tìm tuyến đường phù hợp với điểm đi và điểm đến
        Ưu tiên: xã -> huyện -> tỉnh
        """
        # Tìm theo độ ưu tiên từ chi tiết nhất đến tổng quát nhất
        
        # 1. Tìm chính xác đến xã
        if from_ward_id and to_ward_id:
            route = db.query(models.FixedPriceRoute).filter(
                and_(
                    models.FixedPriceRoute.from_province_id == from_province_id,
                    models.FixedPriceRoute.from_district_id == from_district_id,
                    models.FixedPriceRoute.from_ward_id == from_ward_id,
                    models.FixedPriceRoute.to_province_id == to_province_id,
                    models.FixedPriceRoute.to_district_id == to_district_id,
                    models.FixedPriceRoute.to_ward_id == to_ward_id,
                    models.FixedPriceRoute.is_active == True
                )
            ).first()
            if route:
                return route
        
        # 2. Tìm theo huyện
        if from_district_id and to_district_id:
            route = db.query(models.FixedPriceRoute).filter(
                and_(
                    models.FixedPriceRoute.from_province_id == from_province_id,
                    models.FixedPriceRoute.from_district_id == from_district_id,
                    models.FixedPriceRoute.from_ward_id.is_(None),
                    models.FixedPriceRoute.to_province_id == to_province_id,
                    models.FixedPriceRoute.to_district_id == to_district_id,
                    models.FixedPriceRoute.to_ward_id.is_(None),
                    models.FixedPriceRoute.is_active == True
                )
            ).first()
            if route:
                return route
        
        # 3. Tìm theo tỉnh
        route = db.query(models.FixedPriceRoute).filter(
            and_(
                models.FixedPriceRoute.from_province_id == from_province_id,
                models.FixedPriceRoute.from_district_id.is_(None),
                models.FixedPriceRoute.from_ward_id.is_(None),
                models.FixedPriceRoute.to_province_id == to_province_id,
                models.FixedPriceRoute.to_district_id.is_(None),
                models.FixedPriceRoute.to_ward_id.is_(None),
                models.FixedPriceRoute.is_active == True
            )
        ).first()
        
        return route
    
    def search_routes(self, db: Session, search_text: str = "", skip: int = 0, limit: int = 100) -> List[models.FixedPriceRoute]:
        """Tìm kiếm cấu hình giá cố định theo text"""
        query = db.query(models.FixedPriceRoute).filter(models.FixedPriceRoute.is_active == True)
        
        if search_text:
            search_filter = or_(
                models.FixedPriceRoute.from_address_text.ilike(f"%{search_text}%"),
                models.FixedPriceRoute.to_address_text.ilike(f"%{search_text}%"),
                models.FixedPriceRoute.description.ilike(f"%{search_text}%")
            )
            query = query.filter(search_filter)
        
        return query.order_by(models.FixedPriceRoute.created_at.desc()).offset(skip).limit(limit).all()
    
    def _smart_address_match(self, route_address: str, input_address: str) -> bool:
        """Logic thông minh để match địa chỉ không có trong synonyms
        
        Args:
            route_address: Địa chỉ trong cấu hình (đã normalize)
            input_address: Địa chỉ từ input (đã normalize)
            
        Returns:
            bool: True nếu match, False nếu không
        """
        # Danh sách stopwords cần bỏ qua
        stopwords = {'tỉnh', 'thành', 'phố', 'thành phố', 'tinh', 'thanh', 'pho', 'thanh pho', 'việt nam', 'vietnam', 'vn'}
        
        def clean_address(addr):
            """Loại bỏ stopwords và chuẩn hóa"""
            words = addr.split()
            cleaned_words = []
            for word in words:
                word_clean = word.strip('.,();')
                if word_clean not in stopwords and len(word_clean) > 1:
                    cleaned_words.append(word_clean)
            return ' '.join(cleaned_words)
        
        def remove_diacritics(text):
            """Loại bỏ dấu tiếng Việt để so sánh"""
            replacements = {
                'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
                'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
                'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
                'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
                'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
                'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
                'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
                'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
                'đ': 'd'
            }
            for accented, plain in replacements.items():
                text = text.replace(accented, plain)
            return text
        
        # Chuẩn hóa địa chỉ
        route_clean = clean_address(route_address)
        input_clean = clean_address(input_address)
        
        # Loại bỏ dấu để so sánh
        route_no_accent = remove_diacritics(route_clean)
        input_no_accent = remove_diacritics(input_clean)
        
        print(f"       Smart matching:")
        print(f"         Route clean: '{route_clean}' -> no accent: '{route_no_accent}'")
        print(f"         Input clean: '{input_clean}' -> no accent: '{input_no_accent}'")
        
        # Kiểm tra các cách match
        # 1. Contains sau khi clean
        if route_clean in input_clean or input_clean in route_clean:
            print(f"         ✅ Clean contains match")
            return True
        
        # 2. Contains sau khi bỏ dấu
        if route_no_accent in input_no_accent or input_no_accent in route_no_accent:
            print(f"         ✅ No-accent contains match")
            return True
        
        # 3. Word-level matching (ít nhất 60% từ khớp)
        route_words = set(route_no_accent.split())
        input_words = set(input_no_accent.split())
        
        if route_words and input_words:
            common_words = route_words.intersection(input_words)
            match_ratio_route = len(common_words) / len(route_words)
            match_ratio_input = len(common_words) / len(input_words)
            
            # Nếu > 60% từ khớp từ cả 2 phía hoặc > 80% từ một phía
            if (match_ratio_route >= 0.6 and match_ratio_input >= 0.6) or match_ratio_route >= 0.8 or match_ratio_input >= 0.8:
                print(f"         ✅ Word match (route: {match_ratio_route:.1%}, input: {match_ratio_input:.1%})")
                return True
        
        print(f"         ❌ No smart match found")
        return False
    
    def find_matching_route_by_text(self, db: Session, from_address: str, to_address: str) -> Optional[models.FixedPriceRoute]:
        """Tìm tuyến giá cố định dựa trên text địa chỉ
        
        Args:
            from_address: Địa chỉ điểm đi (VD: "TP.HCM", "Hà Nội", "Quận 1, TP.HCM")
            to_address: Địa chỉ điểm đến
            
        Returns:
            FixedPriceRoute nếu tìm thấy, None nếu không có
        """
        if not from_address or not to_address:
            return None
            
        # Normalize địa chỉ để so sánh (lowercase, strip)
        from_addr_normalized = from_address.lower().strip()
        to_addr_normalized = to_address.lower().strip()
        
        print(f"🔍 Searching fixed price routes for:")
        print(f"   From: '{from_address}' -> normalized: '{from_addr_normalized}'")
        print(f"   To: '{to_address}' -> normalized: '{to_addr_normalized}'")
        
        # Từ khóa đồng nghĩa cho các tỉnh/thành phố phổ biến
        synonyms = {
            'hồ chí minh': ['tp.hcm', 'tphcm', 'ho chi minh', 'thành phố hồ chí minh', 'saigon', 'sài gòn', 'hcm'],
            'hà nội': ['hanoi', 'thủ đô', 'thành phố hà nội', 'hn'],
            'đà nẵng': ['da nang', 'thành phố đà nẵng', 'danang'],
            'cần thơ': ['can tho', 'thành phố cần thơ', 'cantho'],
            'bến tre': ['ben tre', 'tỉnh bến tre', 'bentre'],
            'an giang': ['angiang', 'tỉnh an giang'],
            'bà rịa vũng tàu': ['ba ria vung tau', 'vung tau', 'vũng tàu', 'brvt'],
            'bắc giang': ['bac giang', 'tỉnh bắc giang'],
            'bắc kạn': ['bac kan', 'tỉnh bắc kạn'],
            'bạc liêu': ['bac lieu', 'tỉnh bạc liêu'],
            'bắc ninh': ['bac ninh', 'tỉnh bắc ninh'],
            'bình định': ['binh dinh', 'tỉnh bình định'],
            'bình dương': ['binh duong', 'tỉnh bình dương'],
            'bình phước': ['binh phuoc', 'tỉnh bình phước'],
            'bình thuận': ['binh thuan', 'tỉnh bình thuận'],
            'cà mau': ['ca mau', 'tỉnh cà mau'],
            'cao bằng': ['cao bang', 'tỉnh cao bằng'],
            'đắk lắk': ['dak lak', 'đắk lắk', 'daklak'],
            'đắk nông': ['dak nong', 'đắk nông'],
            'điện biên': ['dien bien', 'tỉnh điện biên'],
            'đồng nai': ['dong nai', 'tỉnh đồng nai'],
            'đồng tháp': ['dong thap', 'tỉnh đồng tháp'],
            'gia lai': ['gialai', 'tỉnh gia lai'],
            'hà giang': ['ha giang', 'tỉnh hà giang'],
            'hà nam': ['ha nam', 'tỉnh hà nam'],
            'hà tĩnh': ['ha tinh', 'tỉnh hà tĩnh'],
            'hải dương': ['hai duong', 'tỉnh hải dương'],
            'hải phòng': ['hai phong', 'thành phố hải phòng'],
            'hậu giang': ['hau giang', 'tỉnh hậu giang'],
            'hòa bình': ['hoa binh', 'tỉnh hòa bình'],
            'hưng yên': ['hung yen', 'tỉnh hưng yên'],
            'khánh hòa': ['khanh hoa', 'tỉnh khánh hòa', 'nha trang'],
            'kiên giang': ['kien giang', 'tỉnh kiên giang'],
            'kon tum': ['kontum', 'tỉnh kon tum'],
            'lai châu': ['lai chau', 'tỉnh lai châu'],
            'lâm đồng': ['lam dong', 'tỉnh lâm đồng', 'đà lạt'],
            'lạng sơn': ['lang son', 'tỉnh lạng sơn'],
            'lào cai': ['lao cai', 'tỉnh lào cai'],
            'long an': ['longan', 'tỉnh long an'],
            'nam định': ['nam dinh', 'tỉnh nam định'],
            'nghệ an': ['nghe an', 'tỉnh nghệ an'],
            'ninh bình': ['ninh binh', 'tỉnh ninh bình'],
            'ninh thuận': ['ninh thuan', 'tỉnh ninh thuận'],
            'phú thọ': ['phu tho', 'tỉnh phú thọ'],
            'phú yên': ['phu yen', 'tỉnh phú yên'],
            'quảng bình': ['quang binh', 'tỉnh quảng bình'],
            'quảng nam': ['quang nam', 'tỉnh quảng nam'],
            'quảng ngãi': ['quang ngai', 'tỉnh quảng ngãi'],
            'quảng ninh': ['quang ninh', 'tỉnh quảng ninh', 'hạ long'],
            'quảng trị': ['quang tri', 'tỉnh quảng trị'],
            'sóc trăng': ['soc trang', 'tỉnh sóc trăng'],
            'sơn la': ['son la', 'tỉnh sơn la'],
            'tây ninh': ['tay ninh', 'tỉnh tây ninh'],
            'thái bình': ['thai binh', 'tỉnh thái bình'],
            'thái nguyên': ['thai nguyen', 'tỉnh thái nguyên'],
            'thanh hóa': ['thanh hoa', 'tỉnh thanh hóa'],
            'thừa thiên huế': ['thua thien hue', 'huế', 'hue', 'tỉnh thừa thiên huế'],
            'tiền giang': ['tien giang', 'tỉnh tiền giang'],
            'trà vinh': ['tra vinh', 'tỉnh trà vinh'],
            'tuyên quang': ['tuyen quang', 'tỉnh tuyên quang'],
            'vĩnh long': ['vinh long', 'tỉnh vĩnh long'],
            'vĩnh phúc': ['vinh phuc', 'tỉnh vĩnh phúc'],
            'yên bái': ['yen bai', 'tỉnh yên bái']
        }
        
        # Tìm route có địa chỉ khớp (case-insensitive)
        # Thử tìm khớp chính xác trước
        route = db.query(models.FixedPriceRoute).filter(
            models.FixedPriceRoute.is_active == True,
            func.lower(models.FixedPriceRoute.from_address_text) == from_addr_normalized,
            func.lower(models.FixedPriceRoute.to_address_text) == to_addr_normalized
        ).first()
        
        if route:
            print(f"✅ Found exact match: {route.from_address_text} -> {route.to_address_text}")
            return route
        
        # Lấy tất cả routes active để kiểm tra từng cái
        active_routes = db.query(models.FixedPriceRoute).filter(
            models.FixedPriceRoute.is_active == True
        ).all()
        
        print(f"🔍 Checking {len(active_routes)} active routes...")
        
        for route in active_routes:
            route_from = route.from_address_text.lower().strip()
            route_to = route.to_address_text.lower().strip()
            
            print(f"   Checking route: '{route.from_address_text}' -> '{route.to_address_text}'")
            
            # Kiểm tra matching cho FROM address
            from_match = False
            
            # 1. Kiểm tra contains trực tiếp
            if route_from in from_addr_normalized or from_addr_normalized in route_from:
                from_match = True
                print(f"     FROM: Direct contains match")
            
            # 2. Kiểm tra với synonyms
            if not from_match:
                for main_name, synonym_list in synonyms.items():
                    if main_name in route_from or any(syn in route_from for syn in synonym_list):
                        if main_name in from_addr_normalized or any(syn in from_addr_normalized for syn in synonym_list):
                            from_match = True
                            print(f"     FROM: Synonym match via '{main_name}'")
                            break
            
            # 3. Logic thông minh cho tỉnh không có trong synonyms
            if not from_match:
                from_match = self._smart_address_match(route_from, from_addr_normalized)
                if from_match:
                    print(f"     FROM: Smart match")
            
            # Kiểm tra matching cho TO address
            to_match = False
            
            # 1. Kiểm tra contains trực tiếp
            if route_to in to_addr_normalized or to_addr_normalized in route_to:
                to_match = True
                print(f"     TO: Direct contains match")
            
            # 2. Kiểm tra với synonyms
            if not to_match:
                for main_name, synonym_list in synonyms.items():
                    if main_name in route_to or any(syn in route_to for syn in synonym_list):
                        if main_name in to_addr_normalized or any(syn in to_addr_normalized for syn in synonym_list):
                            to_match = True
                            print(f"     TO: Synonym match via '{main_name}'")
                            break
            
            # 3. Logic thông minh cho tỉnh không có trong synonyms
            if not to_match:
                to_match = self._smart_address_match(route_to, to_addr_normalized)
                if to_match:
                    print(f"     TO: Smart match")
            
            # Nếu cả FROM và TO đều match thì return route này
            if from_match and to_match:
                print(f"✅ Found matching route: {route.from_address_text} -> {route.to_address_text} (Price: {route.fixed_price})")
                return route
            else:
                print(f"     ❌ No match (FROM: {from_match}, TO: {to_match})")
        
        print("❌ No matching route found")
        return None

# Tạo instance global để sử dụng
fixed_price_routes_crud = FixedPriceRouteCRUD()
