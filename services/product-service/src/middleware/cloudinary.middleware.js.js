const cloudinary = require("cloudinary").v2;
const fs = require("fs"); // Cần thiết để xóa file tạm

// ❗️ Giả sử bạn đã gọi cloudinary.config() ở file app.js
// Hoặc bạn có thể gọi lại ở đây
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = async (req, res, next) => {
  // Config cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // 1. Kiểm tra xem Multer đã xử lý file chưa
  if (!req.file) {
    // Không có file, đi tiếp đến controller
    return next();
  }

  // 2. Lấy đường dẫn file tạm mà Multer đã lưu
  const imagePath = req.file.path;

  // 3. Sử dụng các tùy chọn (options) giống như code của bạn
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    // Gợi ý: Bạn có thể thêm folder để tổ chức ảnh
    // folder: "product_images"
  };

  try {
    // 4. Upload file lên Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, options);

    // 5. Gắn kết quả (URL và public_id) vào req
    // Controller sẽ dùng thông tin này
    req.body.imageUrl = result.secure_url;
    req.body.imagePublicId = result.public_id;

    // 6. Xóa file tạm trên server của bạn sau khi upload
    fs.unlinkSync(imagePath);

    // 7. Đi tiếp đến controller
    next();
  } catch (error) {
    console.error("Lỗi khi upload lên Cloudinary:", error);

    // 6b. Xóa file tạm ngay cả khi có lỗi
    fs.unlinkSync(imagePath);

    return res.status(500).json({ message: "Lỗi upload file." });
  }
};

module.exports = { uploadToCloudinary };
