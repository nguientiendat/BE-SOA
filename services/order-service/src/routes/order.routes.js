// Order routes - to be implemented
const express = require("express");
const { createOrder } = require("../controllers/order.controller");
const { authMiddleware } = require("../../../../shared/auth/auth.middleware");
const router = express.Router();

router.get("/creatoreder", authMiddleware, createOrder);
module.exports = router;
