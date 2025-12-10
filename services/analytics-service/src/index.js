const express = require("express");
const mongoose = require("mongoose");
const { runConsumer } = require("./kafka/consumer");
const analyticsRoutes = require("./routes/analytics.route"); // (Sửa lại đường dẫn cho đúng với file route của bạn)
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3011;
app.get("/health", (req, res) => {
  res.status(200).send("Analytics Service is healthy");
});
app.use("/", analyticsRoutes);
const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/analytics_service",
      {}
    );
    console.log(" MongoDB đã kết nối");
    app.listen(PORT, () => {
      console.log(` Order Service đang chạy trên cổng ${PORT}`);
    });
    await runConsumer();
  } catch (err) {
    console.error("❌ Không thể khởi động dịch vụ:", err);
    process.exit(1); // Dừng ứng dụng nếu có bất kỳ lỗi nào
  }
};
startServer();
