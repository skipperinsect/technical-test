const express = require("express");

const router = express.Router();
const {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
} = require("../controllers/Product");
const { AuthAccess } = require("../middlewares/Auth");

router.get("/product", AuthAccess, getAllProducts);
router.post("/product", AuthAccess, createProduct);
router.delete("/product/:id", AuthAccess, deleteProduct);
router.put("/product/:id", AuthAccess, updateProduct);
router.get("/product/:id", AuthAccess, getProduct);

module.exports = router;
