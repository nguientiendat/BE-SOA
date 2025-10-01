// JWT Configuration Constants
const JWT_CONFIG = {
  DEFAULT_EXPIRES_IN: "24h",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  ACCESS_TOKEN_EXPIRES_IN: "15m",
  SECRET_KEY_LENGTH: 64,
};

// User Roles
const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  SELLER: "seller",
  CUSTOMER: "customer",
};

// Token Types
const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "reset_password",
  EMAIL_VERIFICATION: "email_verification",
};

// Error Messages
const AUTH_ERRORS = {
  NO_TOKEN: "Không có token, truy cập bị từ chối",
  INVALID_TOKEN: "Token không hợp lệ",
  EXPIRED_TOKEN: "Token đã hết hạn",
  INSUFFICIENT_PERMISSIONS: "Không có quyền truy cập",
  USER_NOT_FOUND: "Người dùng không tồn tại",
  INVALID_CREDENTIALS: "Thông tin đăng nhập không đúng",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa",
  EMAIL_NOT_VERIFIED: "Email chưa được xác thực",
};

// Success Messages
const AUTH_SUCCESS = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  REGISTER_SUCCESS: "Đăng ký tài khoản thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  TOKEN_REFRESHED: "Token đã được làm mới",
  PASSWORD_RESET: "Mật khẩu đã được đặt lại",
  EMAIL_VERIFIED: "Email đã được xác thực",
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

module.exports = {
  JWT_CONFIG,
  USER_ROLES,
  TOKEN_TYPES,
  AUTH_ERRORS,
  AUTH_SUCCESS,
  HTTP_STATUS,
};


