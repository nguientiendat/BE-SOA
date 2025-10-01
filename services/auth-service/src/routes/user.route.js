const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (cần authentication)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
