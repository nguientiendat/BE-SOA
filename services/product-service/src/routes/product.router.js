const express = require("express");
const {
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getProductsAdmin,
  restoreProduct,
  editProduct,
  getProductQuantity,
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
router.get("/getdetailproduct/:id", getProductById);
router.post("/getproductsadmin", authMiddleware, getProductsAdmin);
router.post("/restoreproduct", authMiddleware, restoreProduct);
router.get("/checkquantity/:id", getProductQuantity);
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
router.post("/deleteproduct", authMiddleware, deleteProduct);
router.post("/editproduct", authMiddleware, editProduct);

module.exports = router;
