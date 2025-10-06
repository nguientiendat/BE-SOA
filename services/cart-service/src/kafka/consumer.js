const { Kafka } = require("kafkajs");
const Cart = require("../models/cart.model");
const kafka = new Kafka({
  clientId: "cart-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "cart-service-group" });

async function runConsumer() {
  await consumer.connect();
  console.log("📥 [KAFKA] Consumer connected successfully");

  await consumer.subscribe({
    topic: "sign-up-successful",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const user = JSON.parse(message.value.toString());
        console.log(`📥 [KAFKA] New user registered: ${user.email}`);

        // Tạo cart cho user mới
        const newCart = new Cart({
          _id: user.id,
          items: [],
          totalPrice: 0,
        });

        await newCart.save();
        console.log(`🛒 [CART] Cart created for user: ${user.email}`);
      } catch (err) {
        console.error("❌ [KAFKA] Error processing message:", err.message);
      }
    },
  });
}
module.exports = { runConsumer };
