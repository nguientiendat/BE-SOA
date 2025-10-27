const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { start } = require("../jobs/cancelExpiredOrders"); // Đảm bảo đường dẫn đúng

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get("/health", (req, res) => {
  res.status(200).send("Order Service is healthy");
});

app.use("/", require("./routes/order.routes"));

// KẾT NỐI DB TRƯỚC
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/order_service",
    {}
  )
  .then(() => {
    console.log("✅ MongoDB đã kết nối");

    // SAU KHI KẾT NỐI DB THÀNH CÔNG, MỚI KHỞI ĐỘNG SERVER
    app.listen(PORT, () => {
      console.log(`✅ Order Service đang chạy trên cổng ${PORT}`);

      // SAU KHI SERVER CHẠY, MỚI KHỞI ĐỘNG CRON JOB
      start();
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB:", err);
    process.exit(1); // Dừng ứng dụng nếu không kết nối được DB
  });
