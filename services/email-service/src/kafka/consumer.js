const { Kafka } = require("kafkajs");
// Import hàm gửi mail bạn đã tạo
const { sendThankYouEmail } = require("../service/email.service");

const kafka = new Kafka({
  clientId: "email-service",
  brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
});

// QUAN TRỌNG: Dùng groupId KHÁC với order-svc
// Đây là chìa khóa của Pub/Sub.
// Mỗi service nghe cùng 1 topic phải có 1 groupId riêng.
const consumer = kafka.consumer({
  groupId: "email-service-group",
});

const runConsumer = async () => {
  try {
    // 1. Kết nối consumer
    await consumer.connect();
    console.log(" [KAFKA] Consumer (email-svc) đã kết nối.");

    // 2. Đăng ký (Subscribe) topic
    await consumer.subscribe({
      topic: "PAYMENT-SUCCESSFUL-EVENT",
      fromBeginning: true,
    });
    console.log(" [KAFKA] Đã đăng ký topic 'PAYMENT-SUCCESSFUL-EVENT'.");

    // 3. Chạy consumer để lắng nghe
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`[KAFKA] 📩 Nhận được message từ topic ${topic}:`);

        const payload = JSON.parse(message.value.toString());
        console.log(payload);

        // Chỉ xử lý nếu status là SUCCESS
        // (Nếu là FAILED hoặc CANCELLED thì không làm gì)
        if (payload.status === "SUCCESS") {
          // Gọi hàm gửi mail với dữ liệu nhận được
          await sendThankYouEmail(payload);
        } else {
          console.log(`[KAFKA] Bỏ qua message với status: ${payload.status}`);
        }
      },
    });
  } catch (error) {
    console.error("❌ [KAFKA] Lỗi Kafka consumer (email-svc):", error.message);
    process.exit(1); // Dừng app nếu không kết nối được Kafka
  }
};

// Export hàm runConsumer để file index.js gọi
module.exports = { runConsumer };
