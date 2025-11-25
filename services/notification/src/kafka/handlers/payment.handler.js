const handlePaymentSuccess = async (data, io) => {
  try {
    console.log(` [KAFKA] Nhận được CART_ADDED_EVENT: ${data.productId}`);

    for (const item of data.items) {
      const notificationMessage = `"${item.productId}" vừa được thanh toán thành công`;

      io.emit("new-cart-item", {
        message: notificationMessage,
        productName: item.productId,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error(
      "❌ [KAFKA] Lỗi xử lý message CART_ADDED_EVENT:",
      error.message
    );
  }
};

module.exports = { handlePaymentSuccess };
