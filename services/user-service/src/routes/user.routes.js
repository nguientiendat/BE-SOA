const express = require("express");

const { getUserProfile, getAllUsers } = require("../controllers/user.controller");

const { authMiddleware } = require("../../../../shared/auth/auth.middleware");

const router = express.Router();

router.post("/profile", authMiddleware, getUserProfile);
router.get("/allusers", authMiddleware, getAllUsers);
module.exports = router;
