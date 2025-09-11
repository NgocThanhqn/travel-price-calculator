# backend/app/utils/telegram_service.py

import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime

class TelegramService:
    """Service để gửi thông báo Telegram"""
    
    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else None
    
    def set_credentials(self, bot_token: str, chat_id: str):
        """Cập nhật thông tin bot token và chat ID"""
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    def is_configured(self) -> bool:
        """Kiểm tra xem service đã được cấu hình chưa"""
        return bool(self.bot_token and self.chat_id and 
                   self.bot_token != "YOUR_BOT_TOKEN_HERE" and 
                   self.chat_id != "YOUR_CHAT_ID_HERE")
    
    def test_connection(self) -> Dict[str, Any]:
        """Test kết nối với Telegram Bot API"""
        if not self.is_configured():
            return {
                "success": False,
                "error": "Bot token hoặc chat ID chưa được cấu hình"
            }
        
        try:
            # Test bằng cách gọi getMe API
            response = requests.get(f"{self.base_url}/getMe", timeout=10)
            
            if response.status_code == 200:
                bot_info = response.json()
                if bot_info.get("ok"):
                    return {
                        "success": True,
                        "bot_info": {
                            "username": bot_info["result"].get("username"),
                            "first_name": bot_info["result"].get("first_name"),
                            "id": bot_info["result"].get("id")
                        }
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Bot API error: {bot_info.get('description', 'Unknown error')}"
                    }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def send_message(self, message: str, parse_mode: str = "HTML") -> Dict[str, Any]:
        """Gửi tin nhắn đến Telegram"""
        if not self.is_configured():
            return {
                "success": False,
                "error": "Bot token hoặc chat ID chưa được cấu hình"
            }
        
        try:
            payload = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": parse_mode
            }
            
            response = requests.post(
                f"{self.base_url}/sendMessage",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("ok"):
                    return {
                        "success": True,
                        "message_id": result["result"].get("message_id")
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Telegram API error: {result.get('description', 'Unknown error')}"
                    }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def format_booking_message(self, booking_data: Dict[str, Any]) -> str:
        """Format thông tin booking thành message Telegram"""
        try:
            # Format giá tiền
            price_formatted = f"{booking_data['calculated_price']:,.0f}".replace(",", ".")
            
            # Format ngày giờ
            travel_datetime = f"{booking_data['travel_date']} {booking_data['travel_time']}"
            
            # Vehicle type mapping
            vehicle_names = {
                "4_seats": "Xe 4 chỗ",
                "7_seats": "Xe 7 chỗ", 
                "16_seats": "Xe 16 chỗ"
            }
            vehicle_name = vehicle_names.get(booking_data.get('vehicle_type'), booking_data.get('vehicle_type', 'N/A'))
            
            message = f"""🚗 <b>BOOKING MỚI #{booking_data['booking_id']}</b>

👤 <b>Khách hàng:</b> {booking_data['customer_name']}
📱 <b>SĐT:</b> {booking_data['customer_phone']}
📧 <b>Email:</b> {booking_data.get('customer_email', 'N/A')}

🗓️ <b>Thời gian:</b> {travel_datetime}
👥 <b>Số khách:</b> {booking_data['passenger_count']} người
🚙 <b>Loại xe:</b> {vehicle_name}

📍 <b>Điểm đón:</b> {booking_data['from_address']}
📍 <b>Điểm đến:</b> {booking_data['to_address']}

📏 <b>Khoảng cách:</b> {booking_data.get('distance_km', 0):.1f} km
⏱️ <b>Thời gian di chuyển:</b> {booking_data.get('duration_minutes', 0):.0f} phút
💰 <b>Giá:</b> {price_formatted} VNĐ"""

            # Thêm ghi chú nếu có
            if booking_data.get('notes'):
                message += f"\n\n📝 <b>Ghi chú:</b> {booking_data['notes']}"
            
            message += f"\n\n⏰ <i>Thời gian đặt: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</i>"
            
            return message
            
        except Exception as e:
            # Fallback message nếu có lỗi format
            return f"""🚗 BOOKING MỚI #{booking_data.get('booking_id', 'N/A')}

Khách hàng: {booking_data.get('customer_name', 'N/A')}
SĐT: {booking_data.get('customer_phone', 'N/A')}
Từ: {booking_data.get('from_address', 'N/A')}
Đến: {booking_data.get('to_address', 'N/A')}
Giá: {booking_data.get('calculated_price', 0):,.0f} VNĐ

Lỗi format: {str(e)}"""
    
    def send_new_booking_notification(self, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        """Gửi thông báo booking mới"""
        try:
            message = self.format_booking_message(booking_data)
            result = self.send_message(message)
            
            if result["success"]:
                print(f"✅ Telegram notification sent for booking #{booking_data.get('booking_id')}")
            else:
                print(f"❌ Failed to send Telegram notification: {result.get('error')}")
            
            return result
            
        except Exception as e:
            error_msg = f"Error sending Telegram notification: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

# Singleton instance
telegram_service = TelegramService()
