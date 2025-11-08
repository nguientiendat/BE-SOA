const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const producer = kafka.producer();

async function sendUserRegisteredEvent(user) {
  try {
    await producer.connect();
    console.log("📤 [KAFKA] Producer connected successfully");

    await producer.send({
      topic: "sign-up-successful",
      messages: [
        {
          key: user._id.toString(),
          value: JSON.stringify({
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
          }),
        },
      ],
    });

    console.log("📤 [KAFKA] Message sent successfully for user:", user.email);
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
    throw error;
  } finally {
    await producer.disconnect();
  }
}
module.exports = { sendUserRegisteredEvent };
