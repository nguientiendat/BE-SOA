const client = require("@sendgrid/mail");

client.setApiKey(process.env.EMAIL_API);
const SENDER_EMAIL = process.env.SENDER_EMAIL;

// Mock 10 tài khoản để random
const MOCK_ACCOUNTS = [
  { username: 'user001@gmail.com', password: 'TempPass#001' },
  { username: 'user002@gmail.com', password: 'TempPass#002' },
  { username: 'user003@gmail.com', password: 'TempPass#003' },
  { username: 'user004@gmail.com', password: 'TempPass#004' },
  { username: 'user005@gmail.com', password: 'TempPass#005' },
  { username: 'user006@gmail.com', password: 'TempPass#006' },
  { username: 'user007@gmail.com', password: 'TempPass#007' },
  { username: 'user008@gmail.com', password: 'TempPass#008' },
  { username: 'user009@gmail.com', password: 'TempPass#009' },
  { username: 'user010@gmail.com', password: 'TempPass#010' }
];

// Hàm lấy random account
const getRandomAccount = () => {
  const randomIndex = Math.floor(Math.random() * MOCK_ACCOUNTS.length);
  return MOCK_ACCOUNTS[randomIndex];
};

const sendThankYouEmail = async (paymentData) => {
  // Lấy random account nếu không có username/password
  const randomAccount = getRandomAccount();
  
  const { 
    email, 
    orderCode, 
    amount, 
    username = randomAccount.username,    // Random từ 10 accounts
    password = randomAccount.password     // Random từ 10 accounts
  } = paymentData;
  
  console.log(`[Email] Chuẩn bị gửi mail tới ${email} cho đơn ${orderCode}`);
  console.log(`[Email] 🔐 Tài khoản được gửi: ${username}`);

  const message = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Xác nhận đơn hàng #${orderCode} - Thông tin tài khoản`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Cảm ơn bạn đã đặt hàng!</h1>
                  </td>
                </tr>
                
                <!-- Success Message -->
                <tr>
                  <td style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; width: 60px; height: 60px; background-color: #4CAF50; border-radius: 50%; line-height: 60px;">
                        <span style="color: white; font-size: 30px;">✓</span>
                      </div>
                      <h2 style="color: #333333; margin: 15px 0 10px; font-size: 24px;">Thanh toán thành công!</h2>
                      <p style="color: #666666; margin: 0; font-size: 16px;">Đơn hàng của bạn đang được xử lý</p>
                    </div>
                    
                    <!-- Order Info -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <table width="100%" cellpadding="5" cellspacing="0">
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">Mã đơn hàng:</td>
                          <td style="color: #333333; font-weight: 600; font-size: 14px; text-align: right; padding: 8px 0;">#${orderCode}</td>
                        </tr>
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">Tổng tiền:</td>
                          <td style="color: #4CAF50; font-weight: 700; font-size: 16px; text-align: right; padding: 8px 0;">${amount.toLocaleString('vi-VN')} VND</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Account Info -->
                    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                      <h3 style="color: #856404; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
                        <span style="font-size: 20px; margin-right: 8px;">🔐</span>
                        Thông tin tài khoản của bạn
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; border-radius: 4px; margin-bottom: 10px;">
                            <div style="color: #666666; font-size: 12px; margin-bottom: 5px;">Tài khoản:</div>
                            <div style="color: #333333; font-weight: 600; font-size: 15px; font-family: 'Courier New', monospace;">${username}</div>
                          </td>
                        </tr>
                        <tr><td style="height: 10px;"></td></tr>
                        <tr>
                          <td style="padding: 12px; background-color: #ffffff; border-radius: 4px;">
                            <div style="color: #666666; font-size: 12px; margin-bottom: 5px;">Mật khẩu tạm thời:</div>
                            <div style="color: #333333; font-weight: 600; font-size: 15px; font-family: 'Courier New', monospace;">${password}</div>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <strong style="font-size: 14px;">⚠️ BẮT BUỘC: Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu!</strong>
                      </div>
                    </div>
                    
                    <!-- Security Tips -->
                    <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                      <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 14px;">💡 Lưu ý bảo mật:</h4>
                      <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 13px; line-height: 1.6;">
                        <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                        <li>Sử dụng mật khẩu mạnh khi thay đổi (tối thiểu 8 ký tự)</li>
                        <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                      </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://yourwebsite.com/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                        Đăng nhập ngay
                      </a>
                    </div>
                    
                    <!-- Support Info -->
                    <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666666; font-size: 13px;">
                      <p style="margin: 5px 0;">Cần hỗ trợ? Liên hệ chúng tôi:</p>
                      <p style="margin: 5px 0;">
                        📧 Email: <a href="mailto:devine.support@devine.com" style="color: #667eea; text-decoration: none;">support@yourcompany.com</a><br>
                        📞 Hotline: 0326765270
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                      Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Your Company. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await client.send(message);
    console.log(`[Email] ✅ Gửi mail thành công tới ${email}`);
  } catch (error) {
    console.error(`❌ [Email] Lỗi khi gửi mail tới ${email}:`, error.message);
    if (error.response) {
      console.error(
        "[SendGrid Error Body]:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
  }
};

module.exports = { sendThankYouEmail, MOCK_ACCOUNTS, getRandomAccount };