// Kafka consumer - to be implemented
const dotenv = require("dotenv");
dotenv.config();
const { Kafka } = require("kafkajs");
const { PayOS } = require("@payos/node");
// const dotenv = require("dotenv");
const Payment = require("../models/payment.model");
// dotenv.config();
// const { default: axios } = require("axios");
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9094"],
});
console.log("Gia tri cua PayOS la:", PayOS);
const consumer = kafka.consumer({ groupId: "payment-group" });
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  // process.env.Checksum_Key
  process.env.PAYOS_CHECKSUM_KEY
);
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
          //   transactionId: "",
          status: "PENDING",
        });
        await newPayment.save();
        console.log(`Them vao DB thanh cong`);

        const YOUR_DOMAIN = "http://localhost:3000"; // Thay bằng domain của bạn
        const paymentData = {
          orderCode: Number(String(Date.now()).slice(-6)), // Dùng orderCode từ message, không tạo mới!
          amount: order.amount,
          description: `Test PayOS`,
          // items: order.items, // Lấy item từ message nếu có
          returnUrl: `${YOUR_DOMAIN}/payment-success`,
          cancelUrl: `${YOUR_DOMAIN}/payment-cancelled`,
        };
        // ✅ BƯỚC 3: Gọi PayOS để tạo link thanh toán
        console.log(
          `[PAYOS] Creating payment link for order: ${order.orderCode}`
        );
        const paymentLinkResponse = await payOS.paymentRequests.create(
          paymentData
        );
        console.log(`[PAYOS] Response:`, paymentLinkResponse);

        // ✅ BƯỚC 4: Cập nhật lại bản ghi payment với thông tin từ PayOS
        newPayment.status = "PENDING";
        newPayment.transactionId = paymentLinkResponse.paymentLinkId; // Hoặc một ID phù hợp từ PayOS
        // newPayment.paymentUrl = paymentLinkResponse.checkoutUrl;
        await newPayment.save();

        console.log(
          `✅ [SUCCESS] Successfully processed order: ${order.orderCode}`
        );
      } catch (err) {
        console.error("❌ [KAFKA] Error processing message:", err.message);
      }
    },
  });
}
module.exports = { runConsumer };
