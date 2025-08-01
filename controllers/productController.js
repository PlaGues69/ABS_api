const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, fileUrl } = req.body;

    if (!name || !description || !price || !fileUrl) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      fileUrl,
      vendor: req.user._id,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create product", error: error.message });
  }
};
