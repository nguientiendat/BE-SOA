// Tải các biến môi trường (như API key) LÊN TRƯỚC TIÊN
require("dotenv").config();

const { runConsumer } = require("./kafka/consumer");

console.log("🚀 Đang khởi động Email Service...");

// Khởi động consumer
// Nó sẽ kết nối Kafka và bắt đầu lắng nghe
runConsumer();
