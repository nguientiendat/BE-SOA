const User = require("../models/user.model");
const path = require("path");

const { successResponse, errorResponse, conflictResponse } = require(path.join(
  __dirname,
  "../../../../shared/utils/response.js"
));
const { AUTH_SUCCESS, AUTH_ERRORS } = require(path.join(
  __dirname,
  "../../../../shared/auth/constants.js"
));
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.find({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const role = req.user.role;
    if(role !== 'ADMIN'){
      return errorResponse(res, 403, "Bạn không có quyền truy cập tài nguyên này");
    }
    await User.find({}).then((users) => {
      return successResponse(res, 200, "Lấy danh sách người dùng thành công", {
        users: users,
      });
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return errorResponse(
      res,
      500,
      "Lỗi server khi lấy danh sách người dùng",
      error.message
    );
  }
}
module.exports = {
  getUserProfile,getAllUsers
};
