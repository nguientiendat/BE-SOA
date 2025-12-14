const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  phoneNumber: String,
  password: String,
  email: String,
  role: String,
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  status:{ type: String, default: "active" }
});

module.exports = mongoose.model("User", userSchema);
