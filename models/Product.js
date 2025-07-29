const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Product title
    description: { type: String, required: true }, // Details
    price: { type: Number, required: true }, // Price
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who uploaded
    category: { type: String, default: "general" }, // optional field
    fileUrl: { type: String, required: false },
    
  },
  { timestamps: true, collection: "products" }
);

module.exports = mongoose.model("Product", productSchema);
