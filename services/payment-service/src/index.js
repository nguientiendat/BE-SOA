// ✅ BƯỚC 1: ĐẶT LÊN TRÊN CÙNG!
// Đảm bảo đây là dòng code đầu tiên được thực thi.
const dotenv = require("dotenv");
dotenv.config();
console.log("--- STARTING ENV TEST ---");
console.log("PAYOS_CLIENT_ID loaded:", process.env.PAYOS_CLIENT_ID);
console.log("--- ENDING ENV TEST ---");

// ✅ BƯỚE 2: BÂY GIỜ MỚI REQUIRE CÁC FILE KHÁC
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js"); // Bây giờ consumer sẽ thấy các biến env

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

app.get("/health", (req, res) => {
  res.status(200).send("Payment Service is healthy");
});
const paymentRoutes = require("./routes/payment.routes");
app.use("/", paymentRoutes);

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/payment_service",
    {}
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
  runConsumer();
});
