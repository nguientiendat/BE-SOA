const bcrypt = require("bcryptjs");
const path = require("path");
const { generateToken } = require(path.join(
  __dirname,
  "../../../../shared/auth/jwt.utils.js"
));
const { successResponse, errorResponse, conflictResponse } = require(path.join(
  __dirname,
  "../../../../shared/utils/response.js"
));
const { AUTH_SUCCESS, AUTH_ERRORS } = require(path.join(
  __dirname,
  "../../../../shared/auth/constants.js"
));
const User = require("../models/user.model");

// Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return errorResponse(
        res,
        400,
        "Vui lòng cung cấp đầy đủ thông tin: username, email, password"
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictResponse(res, "Email đã được sử dụng");
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return conflictResponse(res, "Username đã được sử dụng");
    }

    // Mã hóa password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Lưu user vào database
    const savedUser = await newUser.save();

    // Tạo JWT token
    const token = generateToken(
      {
        userId: savedUser._id,
        username: savedUser.username,
        role: savedUser.role,
        email: savedUser.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      "24h"
    );

    // Trả về thông tin user (không bao gồm password)
    return successResponse(res, 201, AUTH_SUCCESS.REGISTER_SUCCESS, {
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(
      res,
      500,
      "Lỗi server khi đăng ký tài khoản",
      error.message
    );
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return errorResponse(res, 400, "Vui lòng cung cấp email và password");
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 401, AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Tạo JWT token
    const token = generateToken(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      "24h"
    );

    return successResponse(res, 200, AUTH_SUCCESS.LOGIN_SUCCESS, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Lỗi server khi đăng nhập", error.message);
  }
};

// Lấy thông tin user hiện tại
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return errorResponse(res, 404, AUTH_ERRORS.USER_NOT_FOUND);
    }

    return successResponse(res, 200, "Lấy thông tin user thành công", {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(
      res,
      500,
      "Lỗi server khi lấy thông tin user",
      error.message
    );
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
