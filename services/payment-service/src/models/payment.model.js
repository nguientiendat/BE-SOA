const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderCode: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,

      //*********Sau này thêm vào****************
      // unique: true,
      // sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    counterAccountNumber: {
      type: String,
      default: null,
    },
    paymentLinkId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
