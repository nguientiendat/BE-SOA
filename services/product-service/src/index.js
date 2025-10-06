const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRouter = require("./routes/product.router");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n📥 [PRODUCT-SERVICE] ${req.method} ${req.path}`);
  console.log(`   Headers:`, req.headers);
  // console.log(`   Body:`, req.body ? JSON.stringify(req.body, null, 2) : "No body");
  next();
});

//conectdb
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
//check health
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "product service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", productRouter);

// 404 handler (phải đặt sau hết)
app.use((req, res) => {
  console.log(`[PRODUCT-SERVICE] 404: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});
