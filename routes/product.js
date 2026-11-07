const express = require("express");
const router = express.Router();
const upload =  require("../middlewares/uploadMiddleware");
const productController = require("../controllers/productController");
const { MAX_PRODUCT_IMAGES } = require("../config/constants");
//Xác nhận admin
const {requireAuth} = require("../middlewares/authMiddleware");



router.get("/products", productController.getProducts);
router.get("/products/featured",productController.getFeaturedProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", requireAuth, upload.array("images", MAX_PRODUCT_IMAGES), productController.createProduct);
router.put("/products/:id", requireAuth, upload.array("images", MAX_PRODUCT_IMAGES), productController.updateProduct);
router.patch("/products/:id/featured",requireAuth,productController.toggleFeaturedProduct);
router.delete("/products/:id", requireAuth, productController.deleteProduct);


module.exports = router;
