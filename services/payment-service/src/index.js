const dotenv = require("dotenv");
dotenv.config();
// ... (các log test env của bạn) ...

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");
const { connectProducer } = require("./kafka/producer.js"); // Import hàm connect

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;
app.get("/health", (req, res) => {
  res.status(200).send("Payment Service is healthy");
});
const paymentRoutes = require("./routes/payment.routes");
app.use("/", paymentRoutes);

// BẮT ĐẦU CHUỖI KHỞI ĐỘNG (SEQUENTIAL STARTUP)
console.log("Đang khởi động service...");

// BƯỚC 1: Kết nối MongoDB
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/payment_service",
    {}
  )
  .then(() => {
    console.log("✅ MongoDB đã kết nối");
    // BƯỚC 2: Kết nối Kafka Producer
    return connectProducer(); // Trả về promise
  })
  .then(() => {
    console.log("✅ Kafka Producer đã kết nối");
    // BƯỚC 3: Kết nối Kafka Consumer
    // (Giả sử runConsumer() cũng trả về một promise khi nó connect xong)
    return runConsumer();
  })
  .then(() => {
    console.log("✅ Kafka Consumer đã kết nối và đang lắng nghe");
    // BƯỚC 4: (CUỐI CÙNG) Khởi động Server
    // Giờ đây server 100% sẵn sàng
    app.listen(PORT, () => {
      console.log(`🚀 Payment Service đã SẴN SÀNG trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    // Nếu BẤT KỲ bước nào ở trên thất bại, dừng app
    console.error("❌ Lỗi nghiêm trọng khi khởi động:", err);
    process.exit(1);
  });
