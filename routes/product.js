const express = require("express");
const router = express.Router();
// const {getProducts, getProductById, createProduct, updateProduct, deleteProduct} = require("../controllers/productController")
const productController = require("../controllers/productController");
//Xác nhận admin
const {requireAuth} = require("../middlewares/authMiddleware");



router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", requireAuth, productController.createProduct);
router.put("/products/:id", requireAuth, productController.updateProduct);
router.delete("/products/:id", requireAuth, productController.deleteProduct);


module.exports = router;