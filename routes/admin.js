const express = require("express");
const router = express.Router();
const {requireAuth} = require("../middlewares/authMiddleware");

const path = require("path")

router.get("/", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../views/dashboard.html"));
})

router.get("/add-product", requireAuth, (req, res) =>{
    res.sendFile(path.join(__dirname, "../views/add-product.html"));
})

router.get("/edit-product/:id", requireAuth,(req, res) =>{
    res.sendFile(path.join(__dirname, "../views/edit-product.html"));
})

module.exports = router;