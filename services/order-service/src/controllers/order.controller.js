// Order controller - to be implemented
const Order = require("../models/order.model");
const axios = require("axios");
const mongoose = require("mongoose");
const { sendOrderCreatedEvent } = require("../kafka/producer");
const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log("Token:", token);

    const cartData = await axios.get(`http://localhost:3003/getcart`, {
      headers: { Authorization: token }, // ✅ phải là headers
    });

    console.log("Cart data:", cartData.data);
    if (!cartData.data.items || cartData.data.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartData.data.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
    console.log("Total amount1111:", totalAmount);
    const newOrder = new Order({
      email: req.user.email,
      items: cartData.data.items,
      paymenStatus: "PENDING",
      orderStatus: "CREATED",
      totalPrice: totalAmount,
    });
    newOrder.save();
    sendOrderCreatedEvent(newOrder);
    res
      .status(201)
      .json({ message: "DB Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Lỗi axios:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to get cart data" });
  }
};
module.exports = { createOrder };
