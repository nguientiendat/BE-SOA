const mongoose = require("mongoose");

const ProductStatSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
});

module.exports = mongoose.model("ProductStat", ProductStatSchema);