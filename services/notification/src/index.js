// File: src/index.js
require("dotenv").config(); // Đọc file .env
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");

const app = express();
app.use(cors()); // Sử dụng CORS cho Express

// Tạo server HTTP từ Express app
const server = http.createServer(app);

// Khởi tạo Socket.IO Server và cấu hình CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

// Route đơn giản để kiểm tra server có chạy không
app.get("/health", (req, res) => {
  res.status(200).send("Notification Service is healthy");
});

// Lắng nghe các kết nối Socket.IO
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Một client đã kết nối: ${socket.id}`);

  // Lắng nghe khi client đó ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client đã ngắt kết nối: ${socket.id}`);
  });
});

runConsumer(io).catch((err) => {
  console.error("❌ [KAFKA] Lỗi khởi động consumer:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`✅ Notification Service đang chạy trên cổng ${PORT}`);
});
