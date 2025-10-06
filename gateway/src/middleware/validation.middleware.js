const { errorResponse } = require("../../../shared/utils/response");

/**
 * Request validation middleware
 * @param {Object} schema - Validation schema
 * @returns {Function} Middleware function
 */
const requestValidator = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body, "body");
      errors.push(...bodyErrors);
    }

    // Validate params
    if (schema.params) {
      const paramsErrors = validateObject(req.params, schema.params, "params");
      errors.push(...paramsErrors);
    }

    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query, "query");
      errors.push(...queryErrors);
    }

    if (errors.length > 0) {
      return errorResponse(res, 400, "Dữ liệu không hợp lệ", {
        errors,
        received: {
          body: req.body,
          params: req.params,
          query: req.query,
        },
      });
    }

    next();
  };
};

/**
 * Validate object against schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Validation schema
 * @param {string} location - Location of the object (body, params, query)
 * @returns {Array} Array of errors
 */
const validateObject = (obj, schema, location) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];

    // Check required fields
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field: `${location}.${field}`,
        message: `${field} là bắt buộc`,
        value: value,
      });
      continue;
    }

    // Skip validation if field is not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type && !validateType(value, rules.type)) {
      errors.push({
        field: `${location}.${field}`,
        message: `${field} phải là ${rules.type}`,
        value: value,
        expected: rules.type,
      });
    }

    // String validations
    if (rules.type === "string" && typeof value === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} phải có ít nhất ${rules.minLength} ký tự`,
          value: value,
          minLength: rules.minLength,
        });
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} không được vượt quá ${rules.maxLength} ký tự`,
          value: value,
          maxLength: rules.maxLength,
        });
      }

      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} không đúng định dạng`,
          value: value,
          pattern: rules.pattern,
        });
      }

      if (rules.format === "email" && !isValidEmail(value)) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} không phải là email hợp lệ`,
          value: value,
        });
      }

      if (rules.format === "url" && !isValidUrl(value)) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} không phải là URL hợp lệ`,
          value: value,
        });
      }
    }

    // Number validations
    if (rules.type === "number" && typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} phải lớn hơn hoặc bằng ${rules.min}`,
          value: value,
          min: rules.min,
        });
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} phải nhỏ hơn hoặc bằng ${rules.max}`,
          value: value,
          max: rules.max,
        });
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({
        field: `${location}.${field}`,
        message: `${field} phải là một trong các giá trị: ${rules.enum.join(
          ", "
        )}`,
        value: value,
        allowedValues: rules.enum,
      });
    }
  }

  return errors;
};

/**
 * Validate data type
 * @param {any} value - Value to validate
 * @param {string} type - Expected type
 * @returns {boolean} True if valid
 */
const validateType = (value, type) => {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    default:
      return true;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  requestValidator,
};


