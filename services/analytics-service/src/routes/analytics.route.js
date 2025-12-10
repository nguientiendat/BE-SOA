const express = require("express");
const { getDashboardData } = require("../controllers/analytics.controller");
const { authMiddleware } = require("../../../../shared/auth/auth.middleware");
const router = express.Router();
router.post("/dashboard", authMiddleware, getDashboardData);
module.exports = router;
