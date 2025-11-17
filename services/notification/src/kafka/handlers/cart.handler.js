/**
 * Xử lý khi có sản phẩm được thêm vào giỏ hàng
 * @param {object} data - Dữ liệu từ message Kafka (ví dụ: { id, name, price, ... })
 * @param {SocketIO.Server} io - Instance của Socket.IO server
 */
const handleCartAdded = async (data, io) => {
  try {
    // Log để debug
    console.log(` [KAFKA] Nhận được CART_ADDED_EVENT: ${data.name}`);

    // Tạo nội dung thông báo
    const notificationMessage = `"${data.name}" vừa được thêm vào giỏ hàng!`;

    // Phát sự kiện này đến TẤT CẢ các client đang kết nối
    // (Dùng một tên event mới, ví dụ: 'new-cart-item')
    io.emit("new-cart-item", {
      message: notificationMessage,
      productName: data.name,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(
      "❌ [KAFKA] Lỗi xử lý message CART_ADDED_EVENT:",
      error.message
    );
  }
};

module.exports = { handleCartAdded };
