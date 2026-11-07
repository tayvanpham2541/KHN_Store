const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload 1 ảnh (buffer) lên Cloudinary
function uploadImage(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "honey-store/products"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            }
        );

        stream.end(buffer);
    });
}

// Xóa ảnh trên Cloudinary theo danh sách public_id.
// Không bao giờ throw: lỗi chỉ được ghi log, vì ảnh mồ côi không nên làm hỏng request.
async function deleteImages(publicIds) {
    const ids = (publicIds || []).filter(Boolean);

    if (ids.length === 0) {
        return;
    }

    const results = await Promise.allSettled(
        ids.map(publicId => cloudinary.uploader.destroy(publicId))
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error("Không xóa được ảnh trên Cloudinary:", ids[index], result.reason);
        }
    });
}

// Upload nhiều ảnh cùng lúc, giữ nguyên thứ tự của files.
// Nếu có 1 ảnh lỗi thì xóa các ảnh đã upload và throw lỗi (tránh ảnh mồ côi).
async function uploadImages(files) {
    const results = await Promise.allSettled(
        files.map(file => uploadImage(file.buffer))
    );

    const uploaded = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.value);

    const failed = results.find(result => result.status === "rejected");

    if (failed) {
        await deleteImages(uploaded.map(image => image.publicId));
        throw failed.reason;
    }

    return uploaded;
}

module.exports = {
    cloudinary,
    uploadImages,
    deleteImages
};
