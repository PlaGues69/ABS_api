const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const jwtAuth = require("../middlewares/jwtAuth");
const upload = require("../middlewares/imageUploader");

// Create a new post
router.post("/", jwtAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const author = req.user.userId;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    const newPost = new Post({
      title,
      content,
      author,
      image: req.file ? req.file.path : null
    });

    const savedPost = await newPost.save();
    
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: savedPost
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: err.message
    });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: err.message
    });
  }
});

// Update a post
router.put("/:id", jwtAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateData = { title, content };
    
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: err.message
    });
  }
});

// Delete a post
router.delete("/:id", jwtAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.userId
    });

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: err.message
    });
  }
});

module.exports = router;
