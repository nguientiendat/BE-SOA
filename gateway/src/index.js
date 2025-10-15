const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { authMiddleware } = require("../../shared/auth/auth.middleware");
const app = express();
const PORT = process.env.PORT || 3000;

// // Middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging middleware

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "",
    },
  })
);
app.use(
  "/api/products",
  // authMiddleware,
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/api/products": "",
    },
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
