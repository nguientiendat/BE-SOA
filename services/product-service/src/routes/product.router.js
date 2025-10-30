const express = require("express");
const {
  addProduct,
  getProducts,
  getProductById,
} = require("../controllers/product.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  uploadToCloudinary,
} = require("../middleware/cloudinary.middleware.js");

const router = express.Router();

const path = require("path");
const multer = require("multer");

const uploadPath = path.join(
  __dirname, // --> /my-project/routes
  "..", // --> (Đi lên 1 cấp) /my-project
  "uploads" // --> /my-project/uploads
);

const upload = multer({ dest: uploadPath });
// Public routes (không cần authentication)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (cần authentication)
// Chỉ ADMIN mới có thể thêm sản phẩm
router.post(
  "/addproduct",
  authMiddleware,

  // 2. MIDDLEWARE THỨ NHẤT CHẠY
  upload.single("avatar_url"),

  // 3. MIDDLEWARE THỨ HAI CHẠY
  uploadToCloudinary,

  addProduct
);

module.exports = router;
