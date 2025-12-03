// Order controller - to be implemented
const Order = require("../models/order.model");
const axios = require("axios");
const mongoose = require("mongoose");
const { sendOrderCreatedEvent } = require("../kafka/producer");
const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization;
    // console.log("Token:", token);

    const cartData = await axios.get(`http://cart-service:3003/getcart`, {
      headers: { Authorization: token },
    });

    // console.log("Cart data:", cartData.data);
    if (!cartData.data.items || cartData.data.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartData.data.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
    const orderCode = Date.now();
    const newOrder = await new Order({
      email: req.user.email,
      items: cartData.data.items,
      paymentStatus: "PENDING",
      orderStatus: "CREATED",
      totalPrice: totalAmount,
      orderCode: orderCode.toString(),
      // _id: cartData.data._id,
    });
    const saveDb = await newOrder.save();
    console.log("New order created:", newOrder);

    const eventData = saveDb.toObject();
    eventData.orderCode = orderCode;
    sendOrderCreatedEvent(eventData);
    console.log("order sended to kafka");
    res
      .status(201)
      .json({ message: "DB Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Lỗi axios:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to get cart data" });
  }
};
const getCheckoutUrl = async (req, res) => {
  try {
    console.log("ĐÃ NHẬN ĐƯỢC YÊU CẦU TẠI /checkout/:orderId");
    const idOrder = req.params.orderId;
    const order = await Order.findById(idOrder).select(
      "checkoutUrl orderStatus"
    );
    if (!order) {
      // Trả về 404 để FE biết polling thất bại
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      checkoutUrl: order.checkoutUrl, // Sẽ là "http://..." hoặc null
      orderStatus: order.orderStatus, // Sẽ là "PENDING" hoặc "CANCELLED"
    });
  } catch (error) {
    console.error("Lỗi khi lấy checkout URL:", error.message);
    res.status(500).json({ message: "Failed to get checkout URL" });
  }
};

module.exports = { createOrder, getCheckoutUrl };
