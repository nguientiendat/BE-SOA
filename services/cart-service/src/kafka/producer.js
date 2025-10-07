const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "cart-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const producer = kafka.producer();

async function sendCartUpdatedEvent(product) {
  try {
    await producer.connect();
    console.log("📤 [KAFKA] Producer connected successfully");

    await producer.send({
      topic: "adToCart-successful",
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
