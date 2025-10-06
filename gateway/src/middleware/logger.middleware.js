const morgan = require("morgan");

/**
 * Request Logger Middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = Math.random().toString(36).substr(2, 9);

  // Log request start
  console.log(`\n📥 [${req.id}] ${req.method} ${req.path}`);
  console.log(`   IP: ${req.ip}`);
  console.log(`   User-Agent: ${req.get("User-Agent")}`);
  console.log(`   Content-Type: ${req.get("Content-Type")}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`   Query:`, JSON.stringify(req.query, null, 2));
  }

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 [${req.id}] Response: ${res.statusCode}`);
    if (data && res.get("Content-Type")?.includes("application/json")) {
      try {
        const parsed = JSON.parse(data);
        console.log(`   Data:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(
          `   Data: ${data.substring(0, 200)}${data.length > 200 ? "..." : ""}`
        );
      }
    }
    console.log(`   Time: ${Date.now() - req._startTime}ms\n`);
    originalSend.call(this, data);
  };

  req._startTime = Date.now();
  next();
};

/**
 * Morgan logger configuration
 */
const morganLogger = morgan("combined", {
  skip: (req, res) => {
    // Skip logging for health checks in production
    return process.env.NODE_ENV === "production" && req.path === "/health";
  },
  stream: {
    write: (message) => {
      console.log(message.trim());
    },
  },
});

module.exports = {
  requestLogger,
  morganLogger,
};


