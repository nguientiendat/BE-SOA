const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  phoneNumber: String,
  password: String,
  email: String,
  role: String,
});

module.exports = mongoose.model("User", userSchema);
