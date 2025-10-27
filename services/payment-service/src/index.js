const dotenv = require("dotenv");
dotenv.config();
console.log("--- STARTING ENV TEST ---");
console.log("PAYOS_CLIENT_ID loaded:", process.env.PAYOS_CLIENT_ID);
console.log("--- ENDING ENV TEST ---");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

app.get("/health", (req, res) => {
  res.status(200).send("Payment Service is healthy");
});

const paymentRoutes = require("./routes/payment.routes");
app.use("/", paymentRoutes);

// BẮT ĐẦU KẾT NỐI DB...
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/payment_service",
    {}
  )
  .then(() => {
    // KHI KẾT NỐI THÀNH CÔNG...
    console.log("✅ MongoDB đã kết nối");

    // ...THÌ MỚI BẮT ĐẦU SERVER
    app.listen(PORT, () => {
      console.log(`✅ Payment Service đang chạy trên cổng ${PORT}`);

      // ...VÀ THÌ MỚI CHẠY KAFKA CONSUMER
      // Giờ đây consumer sẽ luôn có kết nối DB sẵn sàng
      runConsumer();
    });
  })
  .catch((err) => {
    // Dừng app nếu không kết nối được DB
    console.error("❌ Không thể kết nối MongoDB:", err);
    process.exit(1);
  });
