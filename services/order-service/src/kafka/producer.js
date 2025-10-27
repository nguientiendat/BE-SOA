const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "order-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9094"],
});

const producer = kafka.producer();

async function sendOrderCreatedEvent(order) {
  try {
    await producer.connect();
    console.log(" [KAFKA] Producer connected successfully");

    await producer.send({
      topic: "ORDER-CREATED",
      messages: [
        {
          key: order._id.toString(),
          value: JSON.stringify({
            orderId: order._id,
            orderCode: order.orderCode,
            amount: order.totalPrice,
            description: `Thanh toán cho mã đơn hàng ${order._id}`,
            email: order.email,
            items: order.items,
          }),
        },
      ],
    });
  } catch (error) {
    console.error(" [KAFKA] Failed to send message:", error.message);
  }
}
module.exports = { sendOrderCreatedEvent };
