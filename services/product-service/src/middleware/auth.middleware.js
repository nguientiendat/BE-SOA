const path = require("path");
const {
  authMiddleware: sharedAuthMiddleware,
  authorizeRoles,
} = require(path.join(__dirname, "../../../../shared/auth/auth.middleware.js"));

// Admin-only middleware
const adminOnly = authorizeRoles("ADMIN");

// Auth middleware that includes admin check
const authMiddleware = async (req, res, next) => {
  try {
    // Use shared auth middleware first
    await new Promise((resolve, reject) => {
      sharedAuthMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Token không hợp lệ",
    });
  }
};

module.exports = {
  authMiddleware,
  adminOnly,
};
