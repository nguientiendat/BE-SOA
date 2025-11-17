const { Kafka } = require("kafkajs");
const { handlePaymentSuccess } = require("./handlers/payment.handler.js");
const { handleCartAdded } = require("./handlers/cart.handler.js");
// const { handleLinkCheckout } = require("./handlers/checkout.handler.js"); // (Ví dụ nếu có)

const kafka = new Kafka({
  clientId: "notification-svc",
  // SỬA 3: Dùng process.env
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const consumer = kafka.consumer({
  groupId: "notification-group",
});

// SỬA 1: 'runConsumer' PHẢI NHẬN 'io' TỪ index.js
const runConsumer = async (io) => {
  try {
    await consumer.connect();
    console.log("[KAFKA] Consumer của Notification-svc đã kết nối");

    await consumer.subscribe({
      topics: ["PAYMENT-SUCCESSFUL-EVENT", "CART-ADDED", "LINK-CHECKOUT-EVENT"], // (Thêm topic nếu cần)
      fromBeginning: true,
    });

    const topicRouter = {
      "PAYMENT-SUCCESSFUL-EVENT": handlePaymentSuccess,
      "CART-ADDED": handleCartAdded,
      // "LINK-CHECKOUT-EVENT": handleLinkCheckout, // (Ví dụ)
    };

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // SỬA 2: Bọc logic trong try...catch
        try {
          const data = JSON.parse(message.value.toString());

          console.log(`[KAFKA] Nhận message từ topic: ${topic}`);

          const handler = topicRouter[topic];

          if (handler) {
            // SỬA 1: TRUYỀN 'data' VÀ 'io' cho handler
            await handler(data, io);
          } else {
            console.warn(
              `[KAFKA] ⚠️ Không tìm thấy handler cho topic: ${topic}`
            );
          }
        } catch (err) {
          console.error(
            `❌ [KAFKA] Lỗi xử lý message cho topic ${topic}:`,
            err.message
          );
          // (Không ném lỗi ra ngoài để consumer tiếp tục chạy)
        }
      },
    });
  } catch (error) {
    console.log("❌ [KAFKA] Lỗi nghiêm trọng, không thể kết nối:", error);
    process.exit(1); // Dừng service nếu không kết nối được Kafka
  }
};
module.exports = { runConsumer };
