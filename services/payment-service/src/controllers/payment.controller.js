// Payment controller - to be implemented
const Payment = require("../models/payment.model");

const createPayment = async (req, res) => {
  try {
    // const payment = runConsumer();
    // console.log("Day la log controlloer payemnt: ", payment);
    // console.log(payment);
    // console.log("#################################");
    console.log("Da nhan duoc message");
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error.message);
    res.status(500).json({ message: "Failed to create payment" });
  }
};
module.exports = { createPayment };
