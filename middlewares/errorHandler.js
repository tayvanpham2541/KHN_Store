const { MAX_PRODUCT_IMAGES } = require("../config/constants");

const multerMessages = {
    LIMIT_FILE_SIZE: "Mỗi ảnh tối đa 5MB",
    LIMIT_FILE_COUNT: `Mỗi sản phẩm tối đa ${MAX_PRODUCT_IMAGES} ảnh`,
    LIMIT_UNEXPECTED_FILE: `Mỗi sản phẩm tối đa ${MAX_PRODUCT_IMAGES} ảnh`
};

function errorHandler(error, req, res, next){
    console.error(error);

    // Lỗi upload từ multer (ảnh quá lớn, quá nhiều ảnh...) là lỗi của người dùng
    if (error.name === "MulterError") {
        return res.status(400).json({
            message: multerMessages[error.code] || "Upload ảnh không hợp lệ"
        });
    }

    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
        message: error.message,
    });
};

module.exports = errorHandler;
