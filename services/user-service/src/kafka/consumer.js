const { Kafka } = require("kafkajs");
const User = require("../models/user.model");

const kafka = new Kafka({
  clientId: "user-service",
  brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "user-service-group" });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: ["sign-up-successful", "PAYMENT-SUCCESSFUL-EVENT"],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const dataUser = JSON.parse(message.value.toString());
        console.log("📩 Nhận message từ Kafka:", topic, dataUser);

        if (topic === "sign-up-successful") {
          // 🧩 Chỉ tạo user khi đăng ký thành công
          const existingUser = await User.findOne({ email: dataUser.email });
          if (existingUser) {
            console.log(`⚠️ User ${dataUser.email} đã tồn tại, bỏ qua.`);
            return;
          }

          const newUser = new User({
            _id: dataUser.id,
            username: dataUser.username,
            email: dataUser.email,
            phoneNumber: dataUser.phoneNumber,
          });

          await newUser.save();
          console.log(`✅ Người dùng mới đã được lưu: ${dataUser.email}`);
        }

        // if (topic === "PAYMENT-SUCCESSFUL-EVENT") {
        //   // 🧩 Cập nhật giỏ hàng hoặc danh sách mua hàng
        //   await User.findOneAndUpdate(
        //     { email: dataUser.email },
        //     {
        //       $push: {
        //         purcharsedProducts: {
        //           $each: dataUser.items.map((item) => ({
        //             productId: item.productId,
        //             quantity: item.quantity,
        //             price: item.price,
        //           })),
        //         },
        //         totalSpent: dataUser.amount,
        //       },
        //     },
        //     { new: true }
        //   );

        //   console.log(`💰 Cập nhật đơn hàng thành công cho ${dataUser.email}`);
        // }
        if (topic === "PAYMENT-SUCCESSFUL-EVENT") {
  // 🧩 Cập nhật giỏ hàng hoặc danh sách mua hàng
  await User.findOneAndUpdate(
    { email: dataUser.email },
    {
      // 1. Dùng $push để thêm sản phẩm vào mảng
      $push: {
        purcharsedProducts: {
          $each: dataUser.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            purchasedAt: new Date() // (Optional) Nên thêm ngày mua để dễ tracking
          })),
        },
      },
      // 2. Dùng $inc để cộng dồn số tiền (Tách riêng ra khỏi $push)
      $inc: {
        totalSpent: dataUser.amount,
      },
    },
    { new: true }
  );

  console.log(`💰 Cập nhật đơn hàng thành công cho ${dataUser.email}`);
}
      } catch (error) {
        console.error("❌ Lỗi khi xử lý tin nhắn từ Kafka:", error);
      }
    },
  });
};

module.exports = { runConsumer };
