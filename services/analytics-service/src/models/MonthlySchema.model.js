const mongoose = require("mongoose");

const MonthlyStatSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  monthName: { type: String }, // "Jan", "Feb"
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalCustomers: { type: Number, default: 0 },
});

// Index để tìm nhanh
MonthlyStatSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyStat", MonthlyStatSchema);