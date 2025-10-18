// Payment controller - to be implemented
const Payment = require("../models/payment.model");
const { runConsumer } = require("../kafka/consumer");

const createPayment = async (req, res) => {
  try {
    const payment = runConsumer();
    console.log(payment);
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error.message);
    res.status(500).json({ message: "Failed to create payment" });
  }
};
module.exports = { createPayment };
