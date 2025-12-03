const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { start } = require("../jobs/cancelExpiredOrders"); // Đảm bảo đường dẫn đúng
const { runConsumer } = require("./kafka/consumer");
const { runProducer } = require("./kafka/producer");
require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get("/health", (req, res) => {
  res.status(200).send("Order Service is healthy");
});

app.use("/", require("./routes/order.routes"));

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/order_service",
      {}
    );
    console.log(" MongoDB đã kết nối");

    await runProducer();

    await runConsumer();

    app.listen(PORT, () => {
      console.log(` Order Service đang chạy trên cổng ${PORT}`);

      start();
    });
  } catch (err) {
    console.error("❌ Không thể khởi động dịch vụ:", err);
    process.exit(1); // Dừng ứng dụng nếu có bất kỳ lỗi nào
  }
};

startServer();
