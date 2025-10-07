// Order model - to be implemented
const mongoose = require("mongoose");

const orderItems = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});
const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  items: [orderItems],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  orderStatus: {
    type: String,
    enum: ["CREATED", "PROCESSING", "COMPLETED", "CANCELLED"],
    default: "CREATED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

