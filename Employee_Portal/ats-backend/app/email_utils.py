# app/email_utils.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Gmail SMTP Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "veilumuthu.selvaraj@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "qoltrukxrgfqteec")

# Frontend URL for reset link
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://portal.dhicreativeservices.com")


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email to the user
    """
    try:
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Password Reset - DHI Employee Portal"
        msg["From"] = f"DHI Consultancy <{SMTP_EMAIL}>"
        msg["To"] = to_email
        
        # Plain text version
        text = f"""
Hello,

You have requested to reset your password for the DHI Employee Portal.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Regards,
DHI Consultancy Team
        """
        
        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #13a581, #0d7a5f); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #13a581, #0d7a5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DHI CONSULTANCY</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for the DHI Employee Portal.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>Regards,<br>DHI Consultancy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 DHI Consultancy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        
        print(f"[EMAIL] Password reset email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {e}")
        return False
