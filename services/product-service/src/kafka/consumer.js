const { Kafka } = require("kafkajs");
const Product = require("../models/product.model");

const kafka = new Kafka({
  clientId: "product-id",
  brokers: ["localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "product-group" });

async function runComsumer(req, res) {
  await consumer.connect();
  console.log("Connected");

  await consumer.subscribe({
    topic: "PAYMENT-SUCCESSFUL-EVENT",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        for (const item of data.items) {
          const productId = item.productId;
          console.log("⚠️⚠️⚠️⚠️PRODUCTID: ", productId);
          console.log("⚠️ quantity: ", item.quantity);
          const product = Product.findById(productId);
          //   console.log(product);
          const update = await Product.updateOne(
            { _id: productId, quantity: { $gte: item.quantity } },
            {
              $inc: {
                quantity: -item.quantity,
              },
            }
          );
          if (update.matchedCount === 0) {
            console.log(
              `ℹ️ KHÔNG THAY ĐỔI: Đã tìm thấy SP ${productId} nhưng quantity không đổi.`
            );
          } else {
            console.log(`✅ THÀNH CÔNG: Đã trừ kho cho SP ${productId}.`);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  });
}

module.exports = runComsumer;
