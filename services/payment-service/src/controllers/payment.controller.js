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
const paymentCancelled = async (req, res) => {
  console.log("ĐÃ NHẬN ĐƯỢC YÊU CẦU TẠI /payment-cancelled");
  if (!req.body) {
    console.log("Failed");
  }
  console.log(req.body);
  const orderCode = req.body.data.orderCode;
  const filter = { orderCode: orderCode };
  console.log(orderCode);
  if (!orderCode) {
    console.log("No order code found");
    res.status(401).json({ message: "No order code found" });
  }
  const updateStatus = req.body.data.desc.toUpperCase();
  const updateDoc = {
    $set: {
      status: updateStatus,
      counterAccountNumber: req.body.data.counterAccountNumber,
      paymentLinkId: req.body.data.paymentLinkId,
    },
  };
  const updatate = await Payment.updateOne(filter, updateDoc);
  console.log("Cập nhật trạng thái thanh toán thành công:", updatate);
};
module.exports = { createPayment, paymentCancelled };
