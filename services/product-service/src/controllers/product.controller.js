const path = require("path");
const Product = require("../models/product.model");
const { successResponse, errorResponse } = require(path.join(
  __dirname,
  "../../../../shared/utils/response.js"
));

//them san pham
const addProduct = async (req, res) => {
  try {
    const {
      name,
      imageUrl,
      imagePublicId,
      price,
      quantity,
      sold_count,
      discount,
      days_valid,
      description,
    } = req.body;
    if (
      !name ||
      !price ||
      !quantity ||
      !sold_count ||
      !discount ||
      !days_valid ||
      !imageUrl ||
      !imagePublicId
    ) {
      return errorResponse(res, 400, "Missing required fields");
    }
    if (price < 0) {
      return errorResponse(res, 400, "Giá sản phẩm không được âm");
    }
    const newProduct = await new Product({
      name,
      // avatar_url,
      price,
      quantity,
      sold_count,
      discount,
      days_valid,
      imageUrl,
      imagePublicId,
      description
    }).save();
    console.log("New product added:", newProduct);
    return successResponse(res, 201, "Thêm sản phẩm thành công", newProduct);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Đã xảy ra lỗi khi thêm sản phẩm",
      error.message
    );
  }
};

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ deleted: false });
    return successResponse(
      res,
      200,
      "Lấy danh sách sản phẩm thành công",
      products
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Đã xảy ra lỗi khi lấy danh sách sản phẩm",
      error.message
    );
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, "Không tìm thấy sản phẩm");
    }

    return successResponse(
      res,
      200,
      "Lấy thông tin sản phẩm thành công",
      product
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Đã xảy ra lỗi khi lấy thông tin sản phẩm",
      error.message
    );
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const productId = req.body.productId;
      let product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      product.deleted = true;
      await product.save();
      res.status(200).json({ message: "Xóa sản phẩm thành công", product });
    } else {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa sản phẩm" });
    }
  } catch (error) {
    console.error("❌ Lỗi xóa sản phẩm:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
const restoreProduct = async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const productId = req.body.productId;
      let product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      product.deleted = false;
      await product.save();
      res.status(200).json({ message: "Xóa sản phẩm thành công", product });
    } else {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa sản phẩm" });
    }
  } catch (error) {
    console.error("❌ Lỗi xóa sản phẩm:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa sản phẩm" });
    }
    const productId = req.body.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const {
      name,
      imageUrl,
      imagePublicId,
      price,
      quantity,
      sold_count,
      discount,
      days_valid,
    } = req.body;
    // Cập nhật các trường nếu chúng được cung cấp trong req.body
    if (name) product.name = name;
    if (imageUrl) product.imageUrl = imageUrl;
    if (imagePublicId) product.imagePublicId = imagePublicId;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ message: "Giá sản phẩm không được âm" });
      }
      product.price = price;
    }
    if (quantity !== undefined) product.quantity = quantity;
    if (sold_count !== undefined) product.sold_count = sold_count;
    if (discount !== undefined) product.discount = discount;
    if (days_valid !== undefined) product.days_valid = days_valid;

    await product.save();
    return res
      .status(200)
      .json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    console.error("❌ Lỗi cập nhật sản phẩm:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getProductsAdmin = async (req, res) => {
  try {
    console.log(req.user.role);
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    const products = await Product.find();
    return successResponse(
      res,
      200,
      "Lấy danh sách sản phẩm thành công",
      products
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Đã xảy ra lỗi khi lấy danh sách sản phẩm",
      error.message
    );
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getProductsAdmin,
  restoreProduct,
  editProduct,
};
