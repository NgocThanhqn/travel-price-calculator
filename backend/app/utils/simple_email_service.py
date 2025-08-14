# backend/app/utils/simple_email_service.py

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv
import os

class SimpleEmailService:
    def __init__(self):
        """Khởi tạo với cấu hình từ environment variables"""
        # Load environment variables from .env file
        load_dotenv()

        # Test load
        print("🔧 Environment variables loaded:")
        print(f"SMTP_USERNAME: {os.getenv('SMTP_USERNAME')}")
        print(f"ADMIN_EMAIL: {os.getenv('ADMIN_EMAIL')}")

        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.username = os.getenv('SMTP_USERNAME')
        self.password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.username)
        self.admin_email = os.getenv('ADMIN_EMAIL')
        self.company_name = os.getenv('COMPANY_NAME', 'Taxi Service')
        
        if not self.username or not self.password:
            print("⚠️ Warning: SMTP credentials not configured")
        
        if not self.admin_email:
            print("⚠️ Warning: Admin email not configured")
    
    def send_new_booking_notification(self, booking_data: Dict[str, Any]) -> bool:
        """
        Gửi email thông báo đơn đặt chuyến mới cho admin
        """
        if not self.admin_email:
            print("ℹ️ No admin email configured, skipping notification")
            return True
        
        if not self.username or not self.password:
            print("ℹ️ SMTP not configured, skipping email")
            return True
        
        try:
            # Tạo nội dung email đơn giản
            subject = f"🚨 ĐƠN MỚI #{booking_data.get('booking_id')} - {booking_data.get('customer_name')}"
            
            # HTML content đơn giản
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px; }}
                    .content {{ background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 10px 0; }}
                    .urgent {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .customer-info {{ background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    table {{ width: 100%; }}
                    td {{ padding: 5px 0; }}
                    .label {{ font-weight: bold; width: 30%; }}
                    .price {{ background: #d4edda; padding: 10px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; color: #155724; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🚨 ĐƠN ĐẶT CHUYẾN MỚI</h2>
                        <p>ID: #{booking_data.get('booking_id')} - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
                    </div>
                    
                    <div class="urgent">
                        <h3 style="color: #dc3545;">⚡ CẦN LIÊN HỆ NGAY:</h3>
                        <p><strong>📞 Gọi cho khách hàng để xác nhận chuyến đi</strong></p>
                    </div>
                    
                    <div class="customer-info">
                        <h3>👤 THÔNG TIN KHÁCH HÀNG</h3>
                        <table>
                            <tr><td class="label">Họ tên:</td><td><strong>{booking_data.get('customer_name')}</strong></td></tr>
                            <tr><td class="label">Điện thoại:</td><td><strong style="color: #dc3545; font-size: 16px;">{booking_data.get('customer_phone')}</strong></td></tr>
                            <tr><td class="label">Email:</td><td>{booking_data.get('customer_email') or 'Không có'}</td></tr>
                        </table>
                    </div>
                    
                    <div class="content">
                        <h3>🚗 CHI TIẾT CHUYẾN ĐI</h3>
                        <table>
                            <tr><td class="label">Ngày giờ:</td><td>{booking_data.get('travel_date')} lúc {booking_data.get('travel_time')}</td></tr>
                            <tr><td class="label">Số khách:</td><td>{booking_data.get('passenger_count')} người</td></tr>
                            <tr><td class="label">Loại xe:</td><td>{booking_data.get('vehicle_type_name')}</td></tr>
                            <tr><td class="label">Từ:</td><td>{booking_data.get('from_address')}</td></tr>
                            <tr><td class="label">Đến:</td><td>{booking_data.get('to_address')}</td></tr>
                            <tr><td class="label">Khoảng cách:</td><td>{booking_data.get('distance_km')} km ({booking_data.get('duration_minutes')} phút)</td></tr>
                        </table>
                        
                        {f'''
                        <div style="margin: 15px 0;">
                            <strong>📝 Ghi chú:</strong>
                            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; font-style: italic;">
                                {booking_data.get('notes')}
                            </div>
                        </div>
                        ''' if booking_data.get('notes') else ''}
                    </div>
                    
                    <div class="price">
                        💰 GIÁ CƯỚC: {f"{booking_data.get('calculated_price', 0):,.0f}".replace(',', '.')} VNĐ
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f1f3f4; border-radius: 5px;">
                        <p style="color: #dc3545; font-weight: bold; margin: 0;">
                            ⏰ Khách hàng đang chờ xác nhận - vui lòng gọi ngay!
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Tạo và gửi email
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = self.admin_email
            
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)
            
            # Gửi email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.username, self.password)
                server.send_message(message)
            
            print(f"✅ Admin notification sent to {self.admin_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send admin notification: {e}")
            return False
    
    def test_email(self, test_email: str = None) -> bool:
        """Test gửi email"""
        test_email = test_email or self.admin_email
        if not test_email:
            print("❌ No test email provided")
            return False
        
        try:
            # Tạo email test đơn giản
            subject = f"[{self.company_name}] Test Email - {datetime.now().strftime('%H:%M:%S')}"
            content = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>✅ Email Test Thành Công!</h2>
                <p>Đây là email test từ hệ thống <strong>{self.company_name}</strong></p>
                <p><strong>Thời gian:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
                <p><strong>Cấu hình SMTP:</strong> {self.smtp_server}:{self.smtp_port}</p>
                <p style="color: green;">Hệ thống email đã sẵn sàng nhận thông báo đơn đặt chuyến!</p>
            </body>
            </html>
            """
            
            message = MIMEMultipart()
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = test_email
            message.attach(MIMEText(content, "html", "utf-8"))
            
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.username, self.password)
                server.send_message(message)
            
            print(f"✅ Test email sent to {test_email}")
            return True
            
        except Exception as e:
            print(f"❌ Test email failed: {e}")
            return False

# Singleton instance
simple_email_service = SimpleEmailService()