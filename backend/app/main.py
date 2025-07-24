from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.routes import router as api_router

# Khởi tạo FastAPI app
app = FastAPI(
    title="Travel Price Calculator API",
    description="API để tính giá tiền di chuyển theo khoảng cách",
    version="1.0.0"
)

# Cấu hình CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api", tags=["API"])

# Route cơ bản để test
@app.get("/")
async def root():
    return {"message": "Travel Price Calculator API đang hoạt động!"}

# Route health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API đang hoạt động tốt"}

# Chạy server nếu file được run trực tiếp
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)