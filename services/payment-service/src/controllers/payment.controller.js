// Payment controller - to be implemented
const Payment = require("../models/payment.model");
const { sendPaymentSuccessfulEvent } = require("../kafka/producer");

const createPayment = async (req, res) => {
  try {
    console.log("Da nhan duoc message");
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error.message);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

const paymentCancelled = async (req, res) => {
  console.log("ĐÃ NHẬN ĐƯỢC YÊU CẦU TẠI /payment-cancelled");

  try {
    const data = req.body.data;
    if (!data || !data.orderCode || !data.desc) {
      console.warn("Dữ liệu webhook không đầy đủ.");
      return res.status(200).json({ message: "Dữ liệu webhook không đầy đủ" });
    }

    const orderCodeNum = data.orderCode;
    const updateStatus = data.desc.toUpperCase();

    const filter = {
      orderCode: orderCodeNum.toString(),
    };

    const updateDoc = {
      $set: {
        status: updateStatus,
        counterAccountNumber: data.counterAccountNumber,
        paymentLinkId: data.paymentLinkId,
        reference: data.reference, // Nên lưu thêm
      },
    };

    const updateResult = await Payment.updateOne(filter, updateDoc);

    if (updateResult.modifiedCount === 0) {
      console.warn(
        `Không tìm thấy document nào để cập nhật với orderCode: ${orderCodeNum}`
      );
      // Trả về lỗi 404 (Không tìm thấy)
      return res.status(200).json({ message: "Không tìm thấy giao dịch" });
    }

    console.log(
      `Cập nhật trạng thái thanh toán thành công cho orderCode: ${orderCodeNum}`
    );
    const paymentDoc = await Payment.findOne(filter);
    const paymentMessage = {
      email: paymentDoc.email,
      amount: data.amount,
      orderCode: orderCodeNum.toString(),
      status: updateStatus,
      items: paymentDoc.items,
    };
    sendPaymentSuccessfulEvent(paymentMessage);

    return res
      .status(200)
      .json({ message: "Webhook đã xử lý thành công", result: updateResult });
  } catch (error) {
    console.error("Lỗi nghiêm trọng khi xử lý webhook:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { createPayment, paymentCancelled };
