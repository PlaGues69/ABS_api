const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyAuth } = require("../middlewares/authorizedUsers");
const upload = require("../middlewares/imageUploader");

// Create product (image is optional)
router.post("/", verifyAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, description, price",
      });
    }

    const imageUrl = req.file ? req.file.path : null;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      fileUrl: imageUrl, // optional image
      vendor: req.user._id, // comes from token middleware
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
});

module.exports = router;
