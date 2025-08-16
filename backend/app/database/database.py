# backend/app/database/database.py

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Import settings để dùng cấu hình thống nhất
try:
    from app.config.settings import settings
    DATABASE_URL = settings.DATABASE_URL
    DATABASE_PATH = DATABASE_URL.replace("sqlite:///", "")
    print(f"✅ Using DATABASE_URL from settings: {DATABASE_URL}")
except ImportError:
    # Fallback nếu không import được settings
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_DIR = os.path.join(BASE_DIR, "database")
    DATABASE_PATH = os.path.join(DATABASE_DIR, "travel_calculator.db")
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    print(f"⚠️ Using fallback DATABASE_URL: {DATABASE_URL}")

# Tạo thư mục database nếu chưa tồn tại
DATABASE_DIR = os.path.dirname(DATABASE_PATH)
os.makedirs(DATABASE_DIR, exist_ok=True)

# Tạo engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},  # Cần cho SQLite
    echo=True  # In SQL queries ra console (để debug)
)

# Tạo SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho các model
Base = declarative_base()

# Dependency để get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hàm tạo tất cả tables
def create_tables():
    Base.metadata.create_all(bind=engine)