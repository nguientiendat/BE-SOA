const mongoose = require("mongoose");

// --- CẤU HÌNH ---
// Đổi lại URI nếu bạn dùng Docker hoặc Cloud
const MONGO_URI = "mongodb://mongodb:27017/analytics_service"; 

// --- 1. ĐỊNH NGHĨA MODEL (Copy từ code của bạn sang để script chạy độc lập) ---
const MonthlyStatSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  monthName: { type: String }, 
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalCustomers: { type: Number, default: 0 },
});
const MonthlyStat = mongoose.model("MonthlyStat", MonthlyStatSchema);

const ProductStatSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  // Thêm field ảnh nếu bạn muốn hiển thị đẹp
  image: { type: String, default: "" } 
});
const ProductStat = mongoose.model("ProductStat", ProductStatSchema);

// --- 2. HÀM SINH DỮ LIỆU NGẪU NHIÊN ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    // --- XÓA DỮ LIỆU CŨ ---
    await MonthlyStat.deleteMany({});
    await ProductStat.deleteMany({});
    console.log("🗑️ Đã dọn sạch dữ liệu cũ");

    // --- A. SEED MONTHLY STATS (12 Tháng gần nhất) ---
    const monthlyData = [];
    const today = new Date();
    
    // Vòng lặp lùi về 11 tháng trước + tháng hiện tại
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthName = d.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"

      // Logic: Doanh thu từ 50tr - 200tr, biến động ngẫu nhiên
      const totalOrders = randomInt(150, 500); 
      const avgOrderValue = randomInt(300000, 800000); // Đơn trung bình 300k - 800k
      const totalRevenue = totalOrders * avgOrderValue;
      const totalCustomers = Math.floor(totalOrders * 0.85); // Giả sử 85% là khách unique

      monthlyData.push({
        year,
        month,
        monthName,
        totalRevenue,
        totalOrders,
        totalCustomers
      });
    }

    await MonthlyStat.insertMany(monthlyData);
    console.log(`✅ Đã tạo dữ liệu cho ${monthlyData.length} tháng.`);

    // --- B. SEED TOP PRODUCTS (10 Sản phẩm) ---
    const productNames = [
      "Netflix Premium 1 tháng",
      "Spotify Premium 1 năm",
      "Youtube Premium Family",
      "Key Windows 11 Pro",
      "Office 365 Personal",
      "ChatGPT Plus Account",
      "Canva Pro Lifetime",
      "Adobe Creative Cloud 1 Year",
      "NordVPN 1 Year",
      "Google One 100GB"
    ];

    const productData = productNames.map((name, index) => {
      const sales = randomInt(50, 1000); // Bán từ 50 - 1000 cái
      const price = randomInt(50000, 1500000); // Giá từ 50k - 1.5tr
      return {
        productId: `prod_mock_${index + 1}`, // ID giả
        productName: name,
        totalSales: sales,
        totalRevenue: sales * price,
        image: "https://via.placeholder.com/150" // Ảnh placeholder nếu cần
      };
    });

    await ProductStat.insertMany(productData);
    console.log(`✅ Đã tạo ${productData.length} sản phẩm bán chạy.`);

    console.log("🎉 SEEDING HOÀN TẤT! Dashboard của bạn giờ đã có dữ liệu.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Lỗi Seeding:", err);
    process.exit(1);
  }
};

seedData();