const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwtAuth = require("../middlewares/jwtAuth");
const upload = require("../middlewares/imageUploader");
const { body, validationResult } = require('express-validator');

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    // Build query
    const { category, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Apply filters
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('vendor', 'firstName lastName email')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'firstName lastName email');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Create product (protected, admin only)
router.post("/", 
  jwtAuth,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create products'
        });
      }

      const { name, description, price, category } = req.body;
      const imageUrl = req.file ? req.file.path : null;

      const newProduct = new Product({
        name,
        description,
        price: Number(price),
        category: category || 'general',
        image: imageUrl,
        vendor: req.user._id
      });

      await newProduct.save();

      res.status(201).json({
        success: true,
        data: newProduct
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  }
);

// Update product (protected, admin only)
router.put("/:id", 
  jwtAuth,
  upload.single('image'),
  async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update products'
        });
      }

      const { name, description, price, category } = req.body;
      const updates = {};
      
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (price) updates.price = Number(price);
      if (category) updates.category = category;
      if (req.file) updates.image = req.file.path;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  }
);

// Delete product (protected, admin only)
router.delete("/:id", jwtAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete products'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Optionally delete the associated image file
    if (product.image) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate('vendor', 'username email');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: err.message
    });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'username email');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: err.message
    });
  }
});

module.exports = router;
