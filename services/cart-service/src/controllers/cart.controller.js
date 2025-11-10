// Cart controller
const Cart = require("../models/cart.model");
const axios = require("axios");
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
    const userId = req.user.userId;

    const { productId } = req.body;

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ _id: userId });
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", cart);
    // if (!cart) {
    //   cart = new Cart({ userId, items: [] });
    // }
    console.log("#####################################", cart.items);
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find((item) =>
      item.productId.equals(productId)
    );

    if (existingItem) {
      return res.status(400).json({ message: "Product already in cart" });
    }

    const getProductInfo = async (productId) => {
      try {
        const response = await axios.get(
          `http://localhost:3002/getdetailproduct/${productId}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching product info:", error);
        return null;
      }
    };
    const product = await getProductInfo(productId);
    console.log(product.data);
    if (product) {
      // Thêm sản phẩm mới
      cart.items.push({
        productId: product.data._id,
        quantity: 1,
        price: product.data.price * (1 - product.data.discount / 100),
      });
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.totalPrice = Math.round(cart.totalPrice * 100) / 100;

      await cart.save();
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(" Thêm sản phẩm thành công");
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.user.userId;
    // Tìm giỏ hàng của user
    const cart = await Cart.findById(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Tìm index của sản phẩm trong giỏ
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    // Nếu không tìm thấy sản phẩm
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Xóa sản phẩm ra khỏi giỏ
    cart.items.splice(itemIndex, 1);

    // Cập nhật lại tổng tiền (nếu bạn có lưu total)
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Lưu thay đổi vào DB
    await cart.save();

    // Trả kết quả mới
    return res.status(200).json({
      message: "Product removed successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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
  removeFromCart,
};
