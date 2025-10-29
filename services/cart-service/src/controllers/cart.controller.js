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
    const userId = req.user.id;
    console.log(userId);
    const { productId } = req.body;

    // Kiểm tra sản phẩm tồn tại (qua ProductService hoặc DB)
    // const product = await Product.findById(productId);
    // if (!product) {
    //   return res.status(404).json({ message: "Product not found" });
    // }

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ userId });
    console.log(cart);
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    console.log(cart.item);
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    if (cart.item) {
      const existingItem = cart.items.find((item) =>
        item.productId.equals(productId)
      );
      if (existingItem) {
        return res.status(400).json({ message: "Product already in cart" });
      }
    }

    // Thêm sản phẩm mới
    cart.items.push({
      productId,
      quantity: 1,
      price: 5000,
    });

    await cart.save();

    // (Tuỳ chọn) Publish event lên Kafka
    // publishToKafka("cart.events", {
    //   eventType: "CartItemAdded",
    //   userId,
    //   cartId: cart._id,
    //   productId,
    //   quantity: 1,
    // });

    console.log("✅ Thêm sản phẩm thành công");
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const removeFromCart = async (userId, productId) => {};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.user.userId);
    console.log(cart);
    if (!cart) {
      console.log(req.user);
      console.log(req.user.userId);
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCart,
  getCart,
  addToCart,
};
