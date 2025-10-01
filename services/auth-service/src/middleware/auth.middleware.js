const path = require("path");
const { authMiddleware: sharedAuthMiddleware } = require(path.join(
  __dirname,
  "../../../../shared/auth/auth.middleware.js"
));
const User = require("../models/user.model");

// Enhanced auth middleware that also checks if user exists in database
const authMiddleware = async (req, res, next) => {
  try {
    // Use shared auth middleware first
    await new Promise((resolve, reject) => {
      sharedAuthMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Additional check: verify user exists in database
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ - user không tồn tại",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Token không hợp lệ",
    });
  }
};

module.exports = authMiddleware;
