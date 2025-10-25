// Payment routes - to be implemented
const express = require("express");
const router = express.Router();
const {
  createPayment,
  paymentCancelled,
} = require("../controllers/payment.controller");

router.post("/", createPayment);
router.post("/payment-cancelled", paymentCancelled);
module.exports = router;
