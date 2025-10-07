const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

app.get("/health", (req, res) => {
  res.status(200).send("Payment Service is healthy");
});

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/payment_service",
    {}
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

runConsumer();

app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});

