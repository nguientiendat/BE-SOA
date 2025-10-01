const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();

// IMPORTANT: Body parsing middleware phải được apply TRƯỚC proxy
// Thường được setup ở app.js level, nhưng có thể add ở đây nếu cần
router.use(express.json({ limit: "10mb" }));
// router.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Debug function để kiểm tra path transformation
const debugPath = (req, res, next) => {
  console.log("\n=== API GATEWAY DEBUG ===");
  console.log(`📥 Original Request:`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));

  // Ensure we can see if body is parsed
  let bodyContent;
  try {
    bodyContent = req.body ? JSON.stringify(req.body, null, 2) : "No body";
  } catch (e) {
    bodyContent = `Body parsing error: ${e.message}`;
  }
  console.log(`   Body:`, bodyContent);

  // Calculate destination path after pathRewrite
  let destPath = req.path;
  if (req.path.startsWith("/api/auth")) {
    destPath = req.path.replace(/^\/api\/auth/, "");
    if (destPath === "") destPath = "/";
  }

  console.log(`📤 Target Service Path: ${destPath}`);
  console.log(
    `🔗 Destination URL: ${
      process.env.AUTH_SERVICE_URL || "http://localhost:3001"
    }${destPath}`
  );
  console.log("=== END DEBUG ===\n");

  next();
};

// Auth service proxy configuration
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  changeOrigin: true,
  timeout: 15000,
  proxyTimeout: 15000,
  pathRewrite: {
    "^/api/auth": "", // Remove prefix khi forward
  },
  // Ensure response is properly forwarded
  xfwd: true,
  secure: false,
  logLevel: "debug",

  // ✅ FIXED: Properly handle parsed body
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[AUTH-PROXY] ${req.method} ${req.path} -> ${proxyReq.path}`);
    console.log(
      `[AUTH-PROXY] Body:`,
      req.body ? JSON.stringify(req.body, null, 2) : "No body"
    );
  },

  onError: (err, req, res) => {
    console.error("Auth service proxy error:", err);
    res.status(503).json({
      success: false,
      message: "Auth service không khả dụng",
      error: "Service temporarily unavailable",
    });
  },

  onProxyRes: (proxyRes, req, res) => {
    console.log(`\n🟢 [AUTH] Response received:`);
    console.log(`   Status: ${proxyRes.statusCode}`);
    console.log(`   Path: ${req.path}`);
    console.log(`   Headers:`, JSON.stringify(proxyRes.headers, null, 2));

    // Set timeout for response
    const responseTimeout = setTimeout(() => {
      console.log(`⚠️ [AUTH] Response timeout for ${req.path}`);
    }, 5000);

    proxyRes.on("end", () => {
      clearTimeout(responseTimeout);
      console.log(`🟢 [AUTH] Response completed for ${req.path}\n`);
    });

    proxyRes.on("error", (err) => {
      clearTimeout(responseTimeout);
      console.error(`❌ [AUTH] Response error for ${req.path}:`, err);
    });

    // Optional: Set response headers to prevent hanging
    res.setTimeout(10000, () => {
      console.log(`⚠️ [AUTH] Client response timeout for ${req.path}`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: "Gateway timeout - service không phản hồi",
        });
      }
    });
  },
});

// Apply debug middleware trước proxy
router.use("/", debugPath);

// Apply proxy to all auth routes
router.use("/", authServiceProxy);

module.exports = router;
