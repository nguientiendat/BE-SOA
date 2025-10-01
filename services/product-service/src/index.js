const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRouter = require("./routes/product.router");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n📥 [PRODUCT-SERVICE] ${req.method} ${req.path}`);
  console.log(`   Headers:`, req.headers);
  // console.log(`   Body:`, req.body ? JSON.stringify(req.body, null, 2) : "No body");
  next();
});

//conectdb
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
//check health
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "product service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", productRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});
