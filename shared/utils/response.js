const { HTTP_STATUS } = require("../auth/constants");

/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
const successResponse = (
  res,
  statusCode = HTTP_STATUS.OK,
  message,
  data = null,
  meta = null
) => {
  const response = {
    success: true,
    message: message || "Thành công",
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} error - Error details
 * @param {Object} meta - Additional metadata
 */
const errorResponse = (
  res,
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message,
  error = null,
  meta = null
) => {
  const response = {
    success: false,
    message: message || "Có lỗi xảy ra",
    timestamp: new Date().toISOString(),
  };

  if (error !== null) {
    response.error = error;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination response format
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginatedResponse = (
  res,
  data,
  pagination,
  message = "Lấy dữ liệu thành công"
) => {
  return successResponse(res, HTTP_STATUS.OK, message, data, {
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false,
    },
  });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors
 * @param {string} message - Error message
 */
const validationErrorResponse = (
  res,
  errors,
  message = "Dữ liệu không hợp lệ"
) => {
  return errorResponse(res, HTTP_STATUS.BAD_REQUEST, message, {
    validation: errors,
  });
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = "Không tìm thấy dữ liệu") => {
  return errorResponse(res, HTTP_STATUS.NOT_FOUND, message);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = "Không có quyền truy cập") => {
  return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, message);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = "Bị cấm truy cập") => {
  return errorResponse(res, HTTP_STATUS.FORBIDDEN, message);
};

/**
 * Conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = "Dữ liệu đã tồn tại") => {
  return errorResponse(res, HTTP_STATUS.CONFLICT, message);
};

/**
 * Internal server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} error - Error details
 */
const internalErrorResponse = (
  res,
  message = "Lỗi server nội bộ",
  error = null
) => {
  return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message, error);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  internalErrorResponse,
};


