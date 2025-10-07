const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { runConsumer } = require("./kafka/consumer.js");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get("/health", (req, res) => {
  res.status(200).send("Order Service is healthy");
});

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/order_service",
    {}
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// runConsumer();

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});

