const productModel = require("../models/productModel");
const imageService = require("../services/imageService");
const { MAX_PRODUCT_IMAGES } = require("../config/constants");

// Chuyển chuỗi JSON như "[3,5]" thành mảng id hợp lệ (bỏ qua giá trị sai)
function parseIdList(value) {
  if (!value) {
    return [];
  }

  try {
    const list = JSON.parse(value);

    if (!Array.isArray(list)) {
      return [];
    }

    return [...new Set(list.map(Number).filter(Number.isInteger))];
  } catch {
    return [];
  }
}


async function getProducts(req, res, next) {
  console.log("Đã chạy Controller lấy tất cả sản phấm");

  try {
    const search = req.query.search || "";

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;

    if (page < 1 || limit < 1) {
      const error = new Error("Page hoặc limit không hợp lệ");
      error.statusCode = 400;
      return next(error);
    }

    const offset = (page - 1) * limit;

    const products = await productModel.findAll(
      search,
      limit,
      offset
    );

    return res.json(products);

  } catch (error) {
    next(error);
  }
};

async function getFeaturedProducts(req, res, next) {
  try {
    const products = await productModel.findFeatured();

    return res.json(products);

  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      //Tạo Error
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      return next(error)

    };
    const product = await productModel.findById(id);
    if (!product) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      return next(error)
    };

    const images = await productModel.findImagesByProductId(id);

    return res.json({
      ...product,
      images: images.map(image => ({
        id: image.id,
        image_url: image.image_url
      }))
    });

  } catch (error) {
    next(error)
  }
};

async function createProduct(req, res, next) {
  let uploadedImages = [];

  try {
    //Lấy dữ liệu
    const {
      name,
      price,
      description
    } = req.body;
    //!name có nghĩa là không có tên nhập vào đúng không "Nếu name là một giá trị Falsy."
    if (!name || !price) {
      const error = new Error("Tên và giá sản phẩm là bắt buộc");
      error.statusCode = 400;
      return next(error);
    }

    if (isNaN(price)) {
      const error = new Error("Giá sản phẩm phải là 1 số");
      error.statusCode = 400;
      return next(error);
    }

    if (price <= 0) {
      const error = new Error("Giá sản phẩm phải lớn hơn 0");
      error.statusCode = 400;
      return next(error);
    }

    const files = req.files || [];

    if (files.length === 0) {
      const error = new Error("Vui lòng chọn ít nhất 1 ảnh sản phẩm");
      error.statusCode = 400;
      return next(error);
    }

    // Upload tất cả ảnh lên Cloudinary (giữ nguyên thứ tự, ảnh đầu tiên là ảnh chính)
    uploadedImages = await imageService.uploadImages(files);

    const result = await productModel.createProduct(
      name,
      price,
      description,
      uploadedImages
    );

    return res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId: result.insertId
    });
  } catch (error) {
    // Lưu DB lỗi thì xóa ảnh vừa upload để không bị ảnh mồ côi
    await imageService.deleteImages(uploadedImages.map(image => image.publicId));
    next(error)
  }
};

async function updateProduct(req, res, next) {
  let uploadedImages = [];

  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      return next(error);
    }

    const {
      name,
      price,
      description
    } = req.body;

    if (!name || !price) {
      const error = new Error("Tên và giá sản phẩm là bắt buộc");
      error.statusCode = 400;
      return next(error);
    }

    if (isNaN(price)) {
      const error = new Error("Giá phải là một số");
      error.statusCode = 400;
      return next(error);
    }

    if (price <= 0) {
      const error = new Error("Giá phải lớn hơn 0");
      error.statusCode = 400;
      return next(error);
    }

    // Tìm sản phẩm hiện tại
    const product = await productModel.findById(id);

    if (!product) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      return next(error);
    }

    // Ảnh hiện có và ảnh muốn xóa (chỉ nhận id thuộc sản phẩm này)
    const existingImages = await productModel.findImagesByProductId(id);
    const existingIds = new Set(existingImages.map(image => image.id));
    const removeIds = parseIdList(req.body.removeImageIds)
      .filter(imageId => existingIds.has(imageId));

    const files = req.files || [];
    const totalImages = existingImages.length - removeIds.length + files.length;

    if (totalImages < 1) {
      const error = new Error("Sản phẩm phải có ít nhất 1 ảnh");
      error.statusCode = 400;
      return next(error);
    }

    if (totalImages > MAX_PRODUCT_IMAGES) {
      const error = new Error(`Mỗi sản phẩm tối đa ${MAX_PRODUCT_IMAGES} ảnh`);
      error.statusCode = 400;
      return next(error);
    }

    // Upload ảnh mới lên Cloudinary (nếu có)
    uploadedImages = await imageService.uploadImages(files);

    const result = await productModel.updateProduct(
      id,
      name,
      price,
      description,
      { removeIds, newImages: uploadedImages }
    );

    if (result.affectedRows === 0) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      return next(error);
    }

    // Đã lưu DB thành công -> xóa ảnh cũ trên Cloudinary
    const removedPublicIds = existingImages
      .filter(image => removeIds.includes(image.id))
      .map(image => image.public_id);

    await imageService.deleteImages(removedPublicIds);

    return res.status(200).json({
      message: "Sản phẩm đã được cập nhật"
    });

  } catch (error) {
    // Lưu DB lỗi thì xóa ảnh mới vừa upload
    await imageService.deleteImages(uploadedImages.map(image => image.publicId));
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      return next(error);
    }
    // Lấy danh sách ảnh trước khi xóa (bảng product_images tự xóa theo sản phẩm)
    const images = await productModel.findImagesByProductId(id);

    const result = await productModel.deleteById(id);
    if (result.affectedRows === 0) {
      const error = new Error("Không tìm thấy sản phẩm")
      error.statusCode = 404;
      return next(error);
    }

    await imageService.deleteImages(images.map(image => image.public_id));

    return res.status(200).json({
      message: "Đã xóa thành công"
    });
  } catch (error) {
    next(error)
  }
}

async function toggleFeaturedProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      return next(error);
    }

    const product = await productModel.findById(id);

    if (!product) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      return next(error);
    }

    const result = await productModel.toggleFeatured(id);

    return res.status(200).json({
      message: product.is_featured
        ? "Đã bỏ sản phẩm khỏi nổi bật"
        : "Đã đặt sản phẩm nổi bật",
      is_featured: !product.is_featured
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeaturedProduct
};
