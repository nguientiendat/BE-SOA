const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());
// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n [AUTH-SERVICE] ${req.method} ${req.path}`);
  console.log(`   Headers:`, req.headers);
  console.log(
    `   Body:`,
    req.body ? JSON.stringify(req.body, null, 2) : "No body"
  );
  next();
});

// Import routes
const userRoutes = require("./routes/user.route");
//db connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Health check endpoint (phải đặt trước routes để có priority)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Routes (đặt sau health check)
app.use("/", userRoutes);

// 404 handler (phải đặt sau hết)
app.use((req, res) => {
  console.log(`[AUTH-SERVICE] 404: ${req.method} ${req.path}`);
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

//lisenning
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
