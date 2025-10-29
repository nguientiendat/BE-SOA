const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9094"],
});

const producer = kafka.producer();
let producerConnected = false;
async function connectProducer() {
  if (producerConnected) {
    return;
  }
  try {
    await producer.connect();
    console.log("📤 [KAFKA] Producer connected successfully");
  } catch (error) {
    console.error("❌ [KAFKA] Failed to connect producer:", error.message);
  }
}

async function sendPaymentSuccessfulEvent(payment) {
  try {
    await producer.send({
      topic: "PAYMENT-SUCCESSFUL-EVENT",
      messages: [
        {
          key: payment.orderCode.toString(),
          value: JSON.stringify({
            email: payment.email,
            amount: payment.amount,
            orderCode: payment.orderCode,
            status: payment.status,
          }),
        },
      ],
    });
    console.log("Gui message thanh cong !!!!");
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
  }
}
module.exports = { connectProducer, sendPaymentSuccessfulEvent };
