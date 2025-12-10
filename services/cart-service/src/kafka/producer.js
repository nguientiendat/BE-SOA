const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "cart-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();

async function connectKafka() {
  try {
    await producer.connect();
    console.log("📤 [KAFKA] Producer connected successfully");
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
  }
}

async function sendCartUpdatedEvent(product) {
  try {
    await producer.send({
      topic: "CART-ADDED",
      messages: [
        {
          key: product._id.toString(),
          value: JSON.stringify({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
          }),
        },
      ],
    });
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
  }
}
module.exports = { sendCartUpdatedEvent, connectKafka };
