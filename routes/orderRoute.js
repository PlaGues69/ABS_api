const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  payForOrder
} = require("../controllers/orderController");

const { verifyAuth, checkAdminRole } = require("../middlewares/authorizedUsers");

//  Place order (user only)
router.post("/", verifyAuth, placeOrder);

//  Pay for order (user only)
router.post("/:id/pay", verifyAuth, payForOrder);

//  Get user's own orders
router.get("/my", verifyAuth, getMyOrders);

//  Get all orders (admin only)
router.get("/all", verifyAuth, checkAdminRole, getAllOrders);

module.exports = router;
