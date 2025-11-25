const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3007;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "product service is healthy",
    timestamp: new Date().toISOString(),
  });
});
const userRoutes = require("./routes/user.routes.js");
app.use("/", userRoutes);
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/user_service",
    {}
  )
  .then(() => {
    console.log(" MongoDB đã kết nối");
    return runConsumer();
  })
  .then(() => {
    console.log(" Kafka Consumer đã kết nối và đang lắng nghe");
    app.listen(PORT, () => {
      console.log(`🚀 User Service đã SẴN SÀNG trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi nghiêm trọng khi khởi động:", err);
    process.exit(1);
  });
