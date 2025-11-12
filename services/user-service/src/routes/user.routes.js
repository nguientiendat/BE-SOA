const express = require("express");

const { getUserProfile } = require("../controllers/user.controller");

const { authMiddleware } = require("../../../../shared/auth/auth.middleware");

const router = express.Router();

router.post("/profile", authMiddleware, getUserProfile);

module.exports = router;
