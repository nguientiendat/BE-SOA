// Payment routes - to be implemented
const express = require("express");
const verifyPayos = require("../middleware/verifyPayos");
const router = express.Router();
const {
  createPayment,
  paymentCancelled,
} = require("../controllers/payment.controller");

router.post("/", createPayment);
router.post("/payment-cancelled", verifyPayos, paymentCancelled);
module.exports = router;
