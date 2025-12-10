const { link } = require("fs");
const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["kafka:9092"],
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

async function createdLinkCheckoutEvent(linkCheckout) {
  try {
    console.log("#################################################### Link CheckOUt Event###########################################")
    await producer.send({
      topic: "LINK-CHECKOUT-EVENT",
      messages: [
        {
          key: linkCheckout.orderCode.toString(),
          value: JSON.stringify({
            checkoutUrl: linkCheckout.checkoutUrl,
            orderCode: linkCheckout.orderCode,
          }),
        },
      ],
    });
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
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
            items: payment.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        },
      ],
    });
    console.log("Gui message thanh cong !!!!");
  } catch (error) {
    console.error("❌ [KAFKA] Failed to send message:", error.message);
  }
}
module.exports = {
  connectProducer,
  sendPaymentSuccessfulEvent,
  createdLinkCheckoutEvent,
};
