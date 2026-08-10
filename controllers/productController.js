const productModel = require("../models/productModel");


async function getProducts(req, res, next) {
  console.log("Đã chạy Controller lấy tất cả sản phấm");
  try {
    //lấy từ khóa tìm kiếm
    const search = req.query.search || "";
    const products = await productModel.findAll(search);

    res.json(products);
  } catch (error) {
    next(error)
  }
};

async function getProductById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      //Tạo Error
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      next(error)

    };
    const product = await productModel.findById(id);
    if (!product) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404 ;
      next(error)
    };

    return res.json(product);
  } catch (error) {
    next(error)
  }
};


async function createProduct(req, res, next) {
  try {
    //Lấy dữ liệu
    const {
      name,
      price,
      image,
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

    const result = await productModel.createProduct(
      name,
      price,
      image,
      description
    );

    return res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId: result.insertId
    });
  } catch (error) {
    next(error)
  }
};

//Cập nhật sản phẩm
async function updateProduct(req, res, next) {
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
      image,
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

    const result = await productModel.updateProduct(
      id,
      name,
      price,
      image,
      description
    );

    if (result.affectedRows === 0) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      message: "Sản phẩm đã được cập nhập"
    });
  } catch (error) {
    next(error)
  }
};

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      const error = new Error("ID không hợp lệ");
      error.statusCode = 400;
      return next(error);
    }
    const result = await productModel.deleteById(id);
    if (result.affectedRows === 0) {
      const error = new Error("Không tìm thấy sản phẩm")
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      message: "Đã xóa thành công"
    });
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
