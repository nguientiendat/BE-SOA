// Cart routes
// TODO: Define cart API endpoints
const express = require("express");
const { addToCart, getCart } = require("../controllers/cart.controller");

const { authMiddleware } = require("../../../../shared/auth/auth.middleware");

const router = express.Router();
router.get("/getcart", authMiddleware, getCart);
router.post("/addtocart", authMiddleware, addToCart);

module.exports = router;



