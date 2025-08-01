const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Place Order 
exports.placeOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newOrder = new Order({
      buyer: buyerId,
      product: productId,
      paid: false, 
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed. Complete payment to receive product.",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// Complete Payment
exports.payForOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("product").populate("buyer");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paid) return res.status(400).json({ message: "Order already paid" });

    // Simulate successful payment
    order.paid = true;
    await order.save();

    const product = order.product;
    const buyer = order.buyer;
    const downloadLink = `${req.protocol}://${req.get("host")}/${product.fileUrl}`;

    await sendEmail({
      to: buyer.email,
      subject: `Your ABS Order - ${product.name}`,
      html: `
        <h2>Thank you for your purchase, ${buyer.firstName}!</h2>
        <p>You purchased: <strong>${product.name}</strong></p>
        <p>Description: ${product.description}</p>
        <p>Download your product here:</p>
        <a href="${downloadLink}">${downloadLink}</a>
        <br/><br/>
        <p>If you have any issues, contact support.</p>
      `,
    });

    res.status(200).json({
      message: "Payment successful and product sent to your email",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

// Get user's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const myOrders = await Order.find({ buyer: req.user._id }).populate("product");
    res.status(200).json({ orders: myOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders", error: error.message });
  }
};

// Get all orders 
exports.getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find().populate("product buyer");
    res.status(200).json({ orders: allOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
  }
};
