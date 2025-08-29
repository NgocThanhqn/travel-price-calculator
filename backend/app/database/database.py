# backend/app/database/database.py

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
#os.path.join(DATABASE_DIR, "travel_calculator.db")
DATABASE_PATH = "D:/Working/database/travel_calculator.db"
# Đường dẫn database URL
DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'travel_calculator.db')}"
# Tạo thư mục database nếu chưa tồn tại
os.makedirs(DATABASE_DIR, exist_ok=True)

# Đường dẫn database URL
DATABASE_URL = "sqlite:///D:/Working/database/travel_calculator.db"

print(f"Database path: {DATABASE_PATH}")  # Debug để xem đường dẫn


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