const express = require("express");
const {
  addProduct,
  getProducts,
  getProductById,
} = require("../controllers/product.controller");
const { authMiddleware, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes (không cần authentication)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (cần authentication)
// Chỉ ADMIN mới có thể thêm sản phẩm
router.post("/addproduct", authMiddleware, adminOnly, addProduct);

module.exports = router;
