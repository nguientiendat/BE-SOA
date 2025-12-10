const { Kafka } = require("kafkajs");
const axios = require("axios"); // Dùng để gọi Product Service
const MonthlyStat = require("../models/MonthlySchema.model");
const ProductStat = require("../models/ProductStats.model");

const kafka = new Kafka({
  clientId: "analytics-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "analytics-group" });

// Cấu hình URL của Product Service (Trong Docker là http://product-service:3002)
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:3002";

const runConsumer = async () => {
  await consumer.connect();
  console.log("📥 [KAFKA] Analytics Consumer connected.");

  await consumer.subscribe({
    topic: "PAYMENT-SUCCESSFUL-EVENT",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        console.log(`[ANALYTICS] Xử lý đơn hàng: ${data.orderCode}`);

        // --- BƯỚC 1: LẤY THÔNG TIN TÊN SẢN PHẨM (ENRICH DATA) ---
        // Vì trong Kafka message không có tên, ta phải gọi API sang Product Service
        // Dùng Promise.all để gọi song song cho nhanh, tránh await từng cái
        // const enrichedItems = await Promise.all(
        //   data.items.map(async (item) => {
        //     try {
        //       // Gọi API: GET /api/products/:id
        //       const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/getdetailproduct/${item.productId}`);
        //       return {
        //         ...item,
        //         name: response.data.name || "Unknown Product", // Lấy tên từ API
        //       };
        //     } catch (err) {
        //       console.warn(`⚠️ Không lấy được tên SP ${item.productId}, dùng tên mặc định.`);
        //       return { ...item, name: "Unknown Product" };
        //     }
        //   })
        // );
        const enrichedItems = await Promise.all(
  data.items.map(async (item) => {
    try {
      // Gọi API sang Product Service
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/getdetailproduct/${item.productId}`);
      
      // JSON của bạn trả về: { success: true, data: { ... } }
      // Nên ta lấy data bên trong bằng cách: response.data.data
      const productInfo = response.data.data; 

      return {
        ...item,
        // Map đúng trường 'name' từ JSON của bạn
        name: productInfo.name || "Unknown Product", 
        
        // Map đúng trường 'imageUrl' từ JSON của bạn (Thay vì 'image')
        image: productInfo.imageUrl || null 
      };
    } catch (err) {
      console.warn(`⚠️ Không lấy được tên SP ${item.productId}, dùng tên mặc định.`);
      return { ...item, name: "Unknown Product" };
    }
  })
);

        // --- BƯỚC 2: TÍNH TOÁN THỜI GIAN ---
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-12
        const monthName = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"...

        // --- BƯỚC 3: CẬP NHẬT THỐNG KÊ THÁNG (MonthlyStats) ---
        await MonthlyStat.findOneAndUpdate(
          { year, month },
          {
            $set: { monthName: monthName }, // Lưu thêm tên tháng cho dễ hiển thị FE
            $inc: {
              totalRevenue: data.amount,
              totalOrders: 1,
              totalCustomers: 1, // Tạm tính mỗi đơn là 1 khách active
            },
          },
          { upsert: true, new: true }
        );

        // --- BƯỚC 4: CẬP NHẬT TOP SẢN PHẨM (ProductStats) ---
        for (const item of enrichedItems) {
          await ProductStat.findOneAndUpdate(
            { productId: item.productId },
            {
              $set: { 
                productName: item.name // Cập nhật tên mới nhất từ API
              },
              $inc: {
                totalSales: item.quantity,
                totalRevenue: item.price * item.quantity,
              },
            },
            { upsert: true }
          );
        }

        console.log(`✅ [ANALYTICS] Đã cập nhật thống kê cho đơn ${data.orderCode}`);

      } catch (error) {
        console.error("❌ [ANALYTICS] Lỗi xử lý message:", error.message);
      }
    },
  });
};

module.exports = { runConsumer };