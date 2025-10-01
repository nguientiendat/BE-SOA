const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên sản phẩm không được vượt quá 200 ký tự"],
    },
    avatar_url: {
      type: String,
      required: [true, "URL ảnh đại diện là bắt buộc"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "URL ảnh không hợp lệ",
      },
    },
    price: {
      type: Number,
      required: [true, "Giá sản phẩm là bắt buộc"],
      min: [0, "Giá sản phẩm không được âm"],
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng là bắt buộc"],
      min: [0, "Số lượng không được âm"],
      default: 0,
    },
    sold_count: {
      type: Number,
      default: 0,
      min: [0, "Số lượng đã bán không được âm"],
    },
    frequently_asked_questions: {
      type: String,
      trim: true,
      maxlength: [2000, "FAQ không được vượt quá 2000 ký tự"],
    },
    discount: {
      type: Number,
      min: [0, "Giảm giá không được âm"],
      max: [100, "Giảm giá không được vượt quá 100%"],
      default: 0,
    },
    days_valid: {
      type: Number,
      min: [1, "Số ngày hiệu lực phải lớn hơn 0"],
      default: 365,
    },
  },
  {
    timestamps: true, // Tự động tạo created_at và updated_at
    toJSON: {
      transform: function (doc, ret) {
        // Convert Decimal128 to Number for JSON response
        if (ret.price) {
          ret.price = parseFloat(ret.price.toString());
        }
        return ret;
      },
    },
  }
);

// Indexes for better performance
productSchema.index({ name: "text" }); // Text search
productSchema.index({ price: 1 }); // Price sorting
productSchema.index({ created_at: -1 }); // Latest products
productSchema.index({ sold_count: -1 }); // Best sellers

// Virtual for discounted price
productSchema.virtual("discounted_price").get(function () {
  if (this.discount > 0) {
    const originalPrice = parseFloat(this.price.toString());
    return originalPrice * (1 - this.discount / 100);
  }
  return parseFloat(this.price.toString());
});

// Virtual for availability status
productSchema.virtual("is_available").get(function () {
  return this.quantity > 0;
});

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Ensure sold_count doesn't exceed quantity
  if (this.sold_count > this.quantity) {
    this.sold_count = this.quantity;
  }
  next();
});

// Static method to find available products
productSchema.statics.findAvailable = function () {
  return this.find({ quantity: { $gt: 0 } });
};

// Static method to find products by price range
productSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    price: {
      $gte: minPrice,
      $lte: maxPrice,
    },
  });
};

module.exports = mongoose.model("Product", productSchema);
