const mongoose = require("mongoose");

const purcharsedProducts = new mongoose.Schema({
  productId: {
    type: String,
    ref: "Product",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, unique: true },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    purcharsedProducts: [purcharsedProducts],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
