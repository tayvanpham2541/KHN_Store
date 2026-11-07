const express = require("express");
const path = require("path")
const router = express.Router();

//Trang chủ
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

//Trang chi tiết sản phẩm
router.get("/product/:id", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "views", "product-detail.html")
    );
});

//Trang đăng nhập
router.get("/login", (req, res) =>{
    res.sendFile(path.join(__dirname, "..","views", "login.html"));
})




module.exports = router;



