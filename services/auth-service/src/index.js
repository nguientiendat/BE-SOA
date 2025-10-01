const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

//lisenning
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
