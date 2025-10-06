const express = require("express");
const mongoose = require("mongoose");
const { runConsumer } = require("./kafka/consumer.js");

const app = express();
const PORT = process.env.PORT || 3003;

app.get("/health", (req, res) => {
  res.status(200).send("Cart Service is healthy");
});

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/cart_service",
    {}
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

runConsumer();

app.listen(PORT, () => {
  console.log(`Cart Service is running on port ${PORT}`);
});
