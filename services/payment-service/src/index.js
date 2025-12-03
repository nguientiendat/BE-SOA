const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");
const { connectProducer } = require("./kafka/producer.js"); // Import hàm connect

const app = express();
// app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;
app.get("/health", (req, res) => {
  res.status(200).send("Payment Service is healthy");
});
const paymentRoutes = require("./routes/payment.routes");
app.use("/", paymentRoutes);

console.log("Đang khởi động service...");

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/payment_service",
    {}
  )
  .then(() => {
    console.log(" MongoDB đã kết nối");
    return connectProducer(); // Trả về promise
  })
  .then(() => {
    console.log(" Kafka Producer đã kết nối");

    return runConsumer();
  })
  .then(() => {
    console.log(" Kafka Consumer đã kết nối và đang lắng nghe");

    app.listen(PORT, () => {
      console.log(`🚀 Payment Service đã SẴN SÀNG trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi nghiêm trọng khi khởi động:", err);
    process.exit(1);
  });
