const multer = require("multer");
const { MAX_PRODUCT_IMAGES } = require("../config/constants");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        const error = new Error("Chỉ cho phép upload file hình ảnh");
        error.statusCode = 400;
        cb(error);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: MAX_PRODUCT_IMAGES
    }
});

module.exports = upload;
