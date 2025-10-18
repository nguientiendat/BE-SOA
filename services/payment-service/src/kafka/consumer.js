// Kafka consumer - to be implemented
const { Kafka } = require("kafkajs");
const Payment = require("../models/payment.model");
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9094"],
});
const consumer = kafka.consumer({ groupId: "payment-group" });

async function runConsumer() {
  await consumer.connect();
  console.log("📥 [KAFKA] Consumer connected successfully");
  await consumer.subscribe({
    topic: "ORDER-CREATED",
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const order = JSON.parse(message.value.toString());
        console.log(`📥 [KAFKA] Order created: ${order.orderCode}`);
        console.log(
          `💰 [PAYMENT] Processing payment for order: ${order.orderCode}`
        );
        const newPayment = new Payment({
          orderId: order.orderCode,
          email: order.email,
          amount: order.amount,
        });
        await newPayment.save();
        console.log(`Them vao DB thanh cong`);
      } catch (err) {
        console.error("❌ [KAFKA] Error processing message:", err.message);
      }
    },
  });
}
module.exports = { runConsumer };
