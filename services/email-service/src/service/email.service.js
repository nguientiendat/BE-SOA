const client = require("@sendgrid/mail");

// 1. Sửa lỗi: Chỉ dùng process.env 1 LẦN
//    Và tên biến .env của bạn nên là SENDGRID_API_KEY
client.setApiKey(process.env.EMAIL_API);

const SENDER_EMAIL = process.env.SENDER_EMAIL;
// console.log(process.env.SENDGRID_API_KEY);
// 2. Viết 1 hàm đơn giản
const sendThankYouEmail = async (paymentData) => {
  const { email, orderCode, amount } = paymentData;
  console.log(`[Email] Chuẩn bị gửi mail tới ${email} cho đơn ${orderCode}`);

  // 3. Tạo một object 'message' đơn giản
  const message = {
    to: email, // Gửi đến 1 người
    from: SENDER_EMAIL, // Gửi từ 1 người
    subject: `Cảm ơn đã đặt hàng! Mã đơn: ${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Thanh toán thành công!</h2>
        <p>Chúng tôi đã nhận được thanh toán cho đơn hàng ${orderCode}.</p>
        <p>Tổng tiền: ${amount} VND</p>
      </div>
    `,
    // Bạn không cần 'personalizations' hay các cài đặt phức tạp kia
  };

  // 4. Gửi mail
  try {
    await client.send(message);
    console.log(`[Email]  Gửi mail thành công tới ${email}`);
  } catch (error) {
    console.error(`❌ [Email] Lỗi khi gửi mail tới ${email}:`, error.message);
    if (error.response) {
      // IN RA LỖI CHI TIẾT TỪ SENDGRID
      console.error(
        "[SendGrid Error Body]:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
  }
};

module.exports = { sendThankYouEmail };
