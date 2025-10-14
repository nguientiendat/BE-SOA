// Cart controller
const Cart = require("../models/cart.model");
const { runConsumer } = require("../kafka/consumer.js");
const Product = require("../../../product-service/src/models/product.model");

const createCart = async (userId) => {
  try {
    const newCart = new Cart({
      _id: userId,
      items: [],
      totalPrice: 0,
    });

    await newCart.save();
    console.log(`🛒 [CART] Cart created for user: ${userId}`);
    return newCart;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

const addToCart = async (req, res) => {
  try {
  const userId = req.user && (req.user.userId || req.user.id);
    const { productId, quantity, price } = req.body;

    // Kiểm tra sản phẩm tồn tại (qua ProductService hoặc DB)
    // const product = await Product.findById(productId);
    // if (!product) {
    //   return res.status(404).json({ message: "Product not found" });
    // }

    // Tìm giỏ hàng của user
    // The Cart schema uses _id as the user's identifier, so query by _id
    let cart = await Cart.findOne({ _id: String(userId) });
    console.log(cart);
    if (!cart) {
      // Create a new cart where _id is the userId (schema expects _id: String)
      cart = new Cart({ _id: String(userId), items: [] });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find((item) =>
      item.productId.equals(productId)
    );
    if (existingItem) {
      return res.status(400).json({ message: "Product already in cart" });
    }
    console.log("userIDDDDDD: :", userId);

    // Thêm sản phẩm mới
    cart.items.push({
      productId,
      quantity,
      price,
    });

    await cart.save();

    console.log("✅ Thêm sản phẩm thành công");
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
  const userId = req.user && (req.user.userId || req.user.id);
  // Cart documents are stored with _id equal to userId
  const cart = await Cart.findOne({ _id: String(userId) });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    console.log("userIDDDDDD: :", userId);
    res.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const removeFromCart = async (userId, productId) => {};
module.exports = {
  createCart,
  getCart,
  addToCart,
};
