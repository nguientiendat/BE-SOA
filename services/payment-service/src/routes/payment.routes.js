// Payment routes - to be implemented
const express = require("express");
const router = express.Router();
const { createPayment } = require("../controllers/payment.controller");

router.post("/", createPayment);

module.exports = router;
