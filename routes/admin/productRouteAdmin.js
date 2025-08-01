const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/imageUploader");

const {
  getAllProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
  createProduct, // 👈 include createProduct here
} = require("../../controllers/admin/productController");

const { verifyAuth, checkAdminRole } = require("../../middlewares/authorizedUsers");

router.get("/", verifyAuth, checkAdminRole, getAllProducts);
router.post("/", verifyAuth, checkAdminRole, upload.single("image"), createProduct);
router.put("/:id/approve", verifyAuth, checkAdminRole, approveProduct);
router.put("/:id/reject", verifyAuth, checkAdminRole, rejectProduct);
router.delete("/:id", verifyAuth, checkAdminRole, deleteProduct);

module.exports = router;