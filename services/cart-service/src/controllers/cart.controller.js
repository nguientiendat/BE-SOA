// Cart controller
// TODO: Implement cart operations (add, remove, update, get)
const Cart = require("../models/cart.model");
const{ runConsumer } = require("../../kafka/consumer.js");
const createCart(userId) = async (req, res) => {
  try {
    runConsumer();
  } catch (error) {
    console.error("Error creating cart:", error);
  }
};
