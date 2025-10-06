const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { requestValidator } = require("../middleware/validation.middleware");

const router = express.Router();

/**
 * Request validation schemas
 */
const registerSchema = {
  body: {
    username: { type: "string", required: true, minLength: 3, maxLength: 50 },
    email: { type: "string", required: true, format: "email" },
    password: { type: "string", required: true, minLength: 6 },
    role: {
      type: "string",
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
};

const loginSchema = {
  body: {
    email: { type: "string", required: true, format: "email" },
    password: { type: "string", required: true, minLength: 1 },
  },
};

/**
 * Auth Service Proxy Configuration
 */
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  changeOrigin: true,
  timeout: 15000,
  proxyTimeout: 15000,
  pathRewrite: {
    "^/api/auth": "", // Remove /api/auth prefix
  },
  xfwd: true,
  secure: false,
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn",

  /**
   * Handle proxy request
   */
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `🔐 [AUTH-PROXY] ${req.method} ${req.path} -> ${proxyReq.path}`
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
      proxyReq.end();
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
      `✅ [AUTH-PROXY] Response: ${proxyRes.statusCode} for ${req.path}`
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
    console.error("❌ [AUTH-PROXY] Error:", {
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
    });

    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: "Auth service không khả dụng",
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

// POST /api/auth/register - Đăng ký tài khoản
router.post("/register", requestValidator(registerSchema), authServiceProxy);

// POST /api/auth/login - Đăng nhập
router.post("/login", requestValidator(loginSchema), authServiceProxy);

// GET /api/auth/profile - Lấy thông tin user (cần token)
router.get("/profile", authServiceProxy);

// GET /api/auth/health - Health check cho auth service
router.get("/health", authServiceProxy);

// Fallback for all other auth routes
router.use("/", authServiceProxy);

module.exports = router;
