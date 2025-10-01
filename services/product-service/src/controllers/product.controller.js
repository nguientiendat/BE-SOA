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
      avatar_url,
      price,
      quantity,
      sold_count,
      discount,
      days_valid,
    } = req.body;
    if (
      !name ||
      !avatar_url ||
      !price ||
      !quantity ||
      !sold_count ||
      !discount ||
      !days_valid
    ) {
      return errorResponse(res, 400, "Missing required fields");
    }
    if (price < 0) {
      return errorResponse(res, 400, "Giá sản phẩm không được âm");
    }
    const newProduct = await new Product({
      name,
      avatar_url,
      price,
      quantity,
      sold_count,
      discount,
      days_valid,
    }).save();

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

module.exports = {
  addProduct,
  getProducts,
  getProductById,
};
