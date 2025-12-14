const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Config Cloudinary (nếu chưa config global)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadDescriptionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được gửi lên" });
    }

    const imagePath = req.file.path;
    
    // Upload lên folder riêng cho description để dễ quản lý
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      folder: "product_description_images", 
    };

    const result = await cloudinary.uploader.upload(imagePath, options);

    // Xóa file tạm
    fs.unlinkSync(imagePath);

    // Trả về URL cho Frontend ngay lập tức
    return res.status(200).json({
      success: true,
      url: result.secure_url, 
    });

  } catch (error) {
    console.error("Lỗi upload ảnh mô tả:", error);
    if (req.file) fs.unlinkSync(req.file.path); // Xóa file nếu lỗi
    return res.status(500).json({ message: "Lỗi upload ảnh" });
  }
};

module.exports = { uploadDescriptionImage };