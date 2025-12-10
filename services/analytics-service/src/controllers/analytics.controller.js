const MonthlyStat = require("../models/MonthlySchema.model");
const ProductStat = require("../models/ProductStats.model");

// Helper: Tính % tăng trưởng
const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 100; // Nếu tháng trước = 0 thì tăng trưởng 100%
  return (((current - previous) / previous) * 100).toFixed(1);
};

// Helper: Format tiền tệ
const formatCurrency = (amount) => {
  if (amount >= 1000000) return `₫${(amount / 1000000).toFixed(2)}M`;
  return `₫${amount.toLocaleString()}`;
};

const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // 1. XÁC ĐỊNH THỜI GIAN HIỆN TẠI & THÁNG TRƯỚC
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 2. LẤY DỮ LIỆU CỦA THÁNG HIỆN TẠI & THÁNG TRƯỚC
    const [currentStats, prevStats] = await Promise.all([
      MonthlyStat.findOne({ year: currentYear, month: currentMonth }),
      MonthlyStat.findOne({ year: prevYear, month: prevMonth }),
    ]);

    // Nếu chưa có data thì mặc định là 0
    const curr = currentStats || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 };
    const prev = prevStats || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 };

    // 3. TÍNH TOÁN % TĂNG TRƯỞNG (GROWTH RATE)
    const revenueGrowth = calculateGrowth(curr.totalRevenue, prev.totalRevenue);
    const orderGrowth = calculateGrowth(curr.totalOrders, prev.totalOrders);
    const customerGrowth = calculateGrowth(curr.totalCustomers, prev.totalCustomers);

    // 4. LẤY BIỂU ĐỒ DOANH THU (6 THÁNG GẦN NHẤT)
    const chartDataRaw = await MonthlyStat.find()
      .sort({ year: -1, month: -1 })
      .limit(6);
    
    const revenueData = chartDataRaw.reverse().map((stat) => ({
      month: stat.monthName || `T${stat.month}`,
      revenue: stat.totalRevenue,
      orders: stat.totalOrders,
      customers: stat.totalCustomers,
    }));

    // 5. LẤY TOP SẢN PHẨM
    const topProductsRaw = await ProductStat.find()
      .sort({ totalSales: -1 })
      .limit(5);

    const topProducts = topProductsRaw.map((p, index) => ({
      id: index + 1,
      name: p.productName,
      sales: p.totalSales,
      revenue: `₫${p.totalRevenue.toLocaleString()}`,
    }));

    // 6. TÍNH TỔNG DOANH THU TÍCH LŨY (LIFETIME)
    const totalAgg = await MonthlyStat.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalRevenue" },
          totalOrders: { $sum: "$totalOrders" },
          totalCustomers: { $sum: "$totalCustomers" },
        },
      },
    ]);
    const lifetime = totalAgg[0] || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 };

    // 7. CẤU TRÚC METRICS HOÀN CHỈNH
    const metrics = [
      {
        title: "Total Revenue",
        value: formatCurrency(lifetime.totalRevenue), // Tổng doanh thu trọn đời
        change: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}%`, // So sánh tháng này vs tháng trước
        isPositive: revenueGrowth >= 0,
      },
      {
        title: "Total Orders",
        value: lifetime.totalOrders.toLocaleString(),
        change: `${orderGrowth > 0 ? "+" : ""}${orderGrowth}%`,
        isPositive: orderGrowth >= 0,
      },
      {
        title: "Total Customers",
        value: lifetime.totalCustomers.toLocaleString(),
        change: `${customerGrowth > 0 ? "+" : ""}${customerGrowth}%`,
        isPositive: customerGrowth >= 0,
      },
      // Conversion Rate rất khó tính chính xác nếu không có data traffic (số người xem web). 
      // Ta có thể tạm tính: (Tổng đơn / Tổng khách) * 100
      {
        title: "Avg. Orders/User", 
        value: lifetime.totalCustomers ? (lifetime.totalOrders / lifetime.totalCustomers).toFixed(2) : "0",
        change: "0%", // Cái này tạm để 0 hoặc tính logic tương tự
        isPositive: true,
      },
    ];

    return res.status(200).json({
      success: true,
      revenueData,
      topProducts,
      metrics,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardData };