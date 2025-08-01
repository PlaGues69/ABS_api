const Product = require("../../models/Product");


exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: "Required fields missing" });
    }

 
    const fileUrl = req.file ? req.file.path : null;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      fileUrl,
      vendor: req.user._id, 
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  // TODO: Implement actual approval logic, e.g., update product status in DB
  res.status(200).json({ message: "Product approved" });
};

exports.rejectProduct = async (req, res) => {
  // TODO: Implement actual rejection logic, e.g., update product status in DB
  res.status(200).json({ message: "Product rejected" });
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to get products", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
