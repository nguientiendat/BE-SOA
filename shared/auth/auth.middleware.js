const { verifyToken, extractTokenFromHeader } = require("./jwt.utils");

/**
 * Authentication middleware for JWT token verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token, truy cập bị từ chối",
      });
    }

    // Verify token
    const decoded = verifyToken(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
    );

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Token không hợp lệ",
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string|Array} allowedRoles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực",
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  optionalAuth,
};
