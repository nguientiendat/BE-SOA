const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { requestValidator } = require("../middleware/validation.middleware");

const router = express.Router();

/**
 * Request validation schemas
 */
const addProductSchema = {
  body: {
    name: { type: "string", required: true, minLength: 1, maxLength: 200 },
    avatar_url: { type: "string", required: true, format: "url" },
    price: { type: "number", required: true, min: 0 },
    quantity: { type: "number", required: true, min: 0 },
    sold_count: { type: "number", required: true, min: 0, default: 0 },
    discount: { type: "number", min: 0, max: 100, default: 0 },
    days_valid: { type: "number", min: 1, default: 365 },
  },
};

const getProductByIdSchema = {
  params: {
    id: { type: "string", required: true, pattern: "^[0-9a-fA-F]{24}$" },
  },
};

/**
 * Product Service Proxy Configuration
 */
const productServiceProxy = createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
  changeOrigin: true,
  timeout: 15000,
  proxyTimeout: 15000,
  pathRewrite: {
    "^/api/products": "", // Remove /api/products prefix
  },
  xfwd: true,
  secure: false,
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn",

  /**
   * Handle proxy request
   */
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `📦 [PRODUCT-PROXY] ${req.method} ${req.path} -> ${proxyReq.path}`
    );

    // Forward body for POST/PUT/PATCH requests
    if (
      req.body &&
      (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
    ) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.write(bodyData);
    }

    // Forward headers
    proxyReq.setHeader("X-Forwarded-For", req.ip);
    proxyReq.setHeader("X-Request-ID", req.id || "unknown");
  },

  /**
   * Handle proxy response
   */
  onProxyRes: (proxyRes, req, res) => {
    console.log(
      `✅ [PRODUCT-PROXY] Response: ${proxyRes.statusCode} for ${req.path}`
    );

    // Add CORS headers
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.CORS_ORIGIN || "http://localhost:3000"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Log response time
    const responseTime = Date.now() - (req._startTime || Date.now());
    res.setHeader("X-Response-Time", `${responseTime}ms`);
  },

  /**
   * Handle proxy errors
   */
  onError: (err, req, res) => {
    console.error("❌ [PRODUCT-PROXY] Error:", {
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
    });

    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: "Product service không khả dụng",
        error: "Service temporarily unavailable",
        retryAfter: "30 seconds",
        timestamp: new Date().toISOString(),
      });
    }
  },
});

/**
 * Routes with validation
 */

// GET /api/products - Lấy danh sách sản phẩm (public)
router.get("/", productServiceProxy);

// GET /api/products/:id - Lấy sản phẩm theo ID (public)
router.get("/:id", requestValidator(getProductByIdSchema), productServiceProxy);

// POST /api/products/addproduct - Thêm sản phẩm mới (cần admin token)
router.post(
  "/addproduct",
  requestValidator(addProductSchema),
  productServiceProxy
);

// GET /api/products/health - Health check cho product service
router.get("/health", productServiceProxy);

// Fallback for all other product routes
router.use("/", productServiceProxy);

module.exports = router;
