const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { verifyAuth } = require("../middlewares/authorizedUsers");
const Order = require("../models/Order");
const Product = require("../models/Product");

// GET /api/download/:productId
router.get("/:productId", verifyAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Check if user purchased this product
    const order = await Order.findOne({
      buyer: userId,
      product: productId,
      paid: true,
    });

    if (!order) {
      return res.status(403).json({ message: "You are not allowed to download this product." });
    }

    // Get product info
    const product = await Product.findById(productId);
    if (!product || !product.fileUrl) {
      return res.status(404).json({ message: "Product or file not found" });
    }

    // Get absolute path to the file
    const filePath = path.join(__dirname, "..", product.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath); // ✅ Sends the file
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});

module.exports = router;
