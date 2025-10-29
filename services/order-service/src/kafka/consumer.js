const { Kafka } = require("kafkajs");
const Order = require("../models/order.model");
const kafka = new Kafka({
  clientId: "order-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "order-service-group" });

const runConsumer = async () => {
  await consumer.connect();
  console.log(" [KAFKA] Consumer connected successfully");

  await consumer.subscribe({
    topic: "PAYMENT-SUCCESSFUL-EVENT",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        console.log(
          ` [KAFKA] Cap nhat don hang ${data.orderCode}: ${data.status}`
        );
        const filter = { orderCode: data.orderCode };
        const update = {
          $set: {
            paymentStatus: data.status,
            orderStatus: data.status,
          },
        };
        const result = await Order.updateOne(filter, update);

        if (result.matchedCount === 0) {
          console.warn(
            `⚠️ [KAFKA] Không tìm thấy đơn hàng ${data.orderCode} để cập nhật.`
          );
        } else {
          console.log(
            ` [KAFKA] Cập nhật đơn hàng ${data.orderCode} thành công.`
          );
        }
      } catch (err) {
        console.error("❌ [KAFKA] Error processing message:", err.message);
      }
    },
  });
};
module.exports = { runConsumer };
