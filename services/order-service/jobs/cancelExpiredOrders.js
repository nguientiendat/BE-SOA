const cron = require("node-cron");
// Đảm bảo đường dẫn này chính xác
const Order = require("../src/models/order.model");

const checkAndCancelOrders = async () => {
  // LOG 1: Báo hiệu job bắt đầu chạy
  console.log(
    `[Cron Job] ----------------------------------------------------`
  );
  console.log(
    `[Cron Job] 🧹 Bắt đầu chạy. Thời gian: ${new Date().toISOString()}`
  );

  // Đổi thành 2 phút để test. Sau này đổi lại 30 phút
  const TIME_LIMIT_MS = 30 * 60 * 1000;
  const TIME_LIMIT = new Date(Date.now() - TIME_LIMIT_MS);

  // LOG 2: In ra mốc thời gian giới hạn
  console.log(
    `[Cron Job] ℹ️ Mốc thời gian giới hạn (cũ hơn): ${TIME_LIMIT.toISOString()}`
  );

  try {
    const filter = {
      orderStatus: "CREATED",
      createdAt: { $lte: TIME_LIMIT },
    };

    console.log("[Cron Job] ℹ Đang dùng bộ lọc:", JSON.stringify(filter));

    const update = {
      $set: { orderStatus: "CANCELLED" },
    };

    const result = await Order.updateMany(filter, update);

    if (result.modifiedCount > 0) {
      console.log(
        `[Cron Job]  Đã hủy thành công ${result.modifiedCount} đơn hàng.`
      );
      console.log("[Cron Job]  Không tìm thấy đơn hàng nào phù hợp để hủy.");
    }
  } catch (error) {
    console.error(
      "[Cron Job]  Lỗi nghiêm trọng khi chạy job:",
      error.message
    );
  }
};

const start = () => {
  console.log(
    "[Cron Job] Khởi tạo lịch trình hủy đơn hàng (chạy mỗi 1 phút)..."
  );

  // Sau này khi chạy thật, hãy đổi lại '*/15 * * * *' (15 phút)
  cron.schedule("*/30 * * * *", checkAndCancelOrders, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  });
};

module.exports = {
  start,
};
