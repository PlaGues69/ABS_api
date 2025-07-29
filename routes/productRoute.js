const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyAuth, checkAdminRole } = require("../middlewares/authorizedUsers");
const upload = require("../middlewares/imageUploader");

// ✅ Create product (image is now optional)
router.post("/", verifyAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // image is optional now
    const imageUrl = req.file ? req.file.path : null;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      fileUrl: imageUrl, // still using fileUrl field
      vendor: req.user._id,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

module.exports = router;
