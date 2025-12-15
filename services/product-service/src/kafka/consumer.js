const { Kafka } = require("kafkajs");
const Product = require("../models/product.model");

const kafka = new Kafka({
  clientId: "product-id",
  brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "product-group" });

async function runComsumer(req, res) {
  await consumer.connect();
  console.log("Connected");

  await consumer.subscribe({
    topic: "PAYMENT-SUCCESSFUL-EVENT",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        for (const item of data.items) {
          const productId = item.productId;
          console.log(`Processing Item: ${productId} - Qty: ${item.quantity}`);

          // --- BƯỚC 1: KIỂM TRA TỒN TẠI ---
          // Thêm await như đã bàn trước đó
          const product = await Product.findById(productId); 

          if (!product) {
            // Nếu null -> Dừng ngay vòng lặp cho item này
            console.error(`❌ LỖI NGHIÊM TRỌNG: Product ID ${productId} không tồn tại trong Database!`);
            console.log("--> Khả năng cao là Database Product Service khác với Database tạo ra Order.");
            continue; // Bỏ qua item này, chuyển sang item tiếp theo
          }

          console.log(`ℹ️ Tồn kho hiện tại: ${product.quantity}`);

          // --- BƯỚC 2: TRỪ KHO (Atomic Update) ---
          const update = await Product.updateOne(
            { _id: productId, quantity: { $gte: item.quantity } },
            {
              $inc: {
                quantity: -item.quantity,
              },
            }
          );

          // --- BƯỚC 3: XỬ LÝ KẾT QUẢ UPDATE ---
          if (update.matchedCount === 0) {
            // Vì đã check tồn tại ở Bước 1, nên nếu vào đây chắc chắn là do thiếu hàng
            console.log(
              `⚠️ HẾT HÀNG: Sản phẩm ${productId} tồn tại nhưng không đủ số lượng (Cần: ${item.quantity}, Có: ${product.quantity})`
            );
            // Ở đây có thể bắn 1 event "ORDER_FAILED" ngược lại Kafka nếu cần
          } else {
            console.log(`✅ THÀNH CÔNG: Đã trừ kho cho SP ${productId}.`);
          }
        }
      } catch (error) {
        console.error("Lỗi xử lý message:", error);
      }
    },
  });
}

module.exports = runComsumer;