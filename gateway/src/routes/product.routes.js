const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();

// Debug function để kiểm tra path transformation
const debugProductPath = (req, res, next) => {
  console.log("\n=== PRODUCT GATEWAY DEBUG ===");
  console.log(`📥 Original Request:`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   URL: ${req.url}`);
  console.log(
    `🔗 Destination URL: ${
      process.env.PRODUCT_SERVICE_URL || "http://localhost:3002"
    }${req.path}`
  );
  console.log("=== END PRODUCT DEBUG ===\n");

  next();
};

// Product service proxy configuration
const productServiceProxy = createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000,
  pathRewrite: {
    "^/api/products": "/api/products", // Keep the same path
  },
  onError: (err, req, res) => {
    console.error("Product service proxy error:", err);
    res.status(503).json({
      success: false,
      message: "Product service không khả dụng",
      error: "Service temporarily unavailable",
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PRODUCT] ${req.method} ${req.path} -> ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PRODUCT] Response: ${proxyRes.statusCode} for ${req.path}`);
  },
});

// Apply debug middleware trước proxy
router.use("/", debugProductPath);

// Apply proxy to all product routes
router.use("/", productServiceProxy);

module.exports = router;
