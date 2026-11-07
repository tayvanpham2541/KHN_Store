const connection = require("../config/db");

async function findAll(search = "", limit = 9, offset = 0) {
  const db = await connection;

  const sql = `
    SELECT *
    FROM products
    WHERE name LIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [results] = await db.query(sql, [
    `%${search}%`,
    limit,
    offset
  ]);

  return results;
};

async function findFeatured() {
  const db = await connection;

  const sql = `
        SELECT *
        FROM products
        WHERE is_active = 1
        AND is_featured = 1
        ORDER BY created_at DESC
    `;

  const [results] = await db.query(sql);
  return results;
}

async function findById(id) {
  const db = await connection;
  const sql = `SELECT *
               FROM products
               WHERE id = ?`
  const [results] = await db.query(sql, [id]);
  return results[0];
};

// Lấy danh sách ảnh của 1 sản phẩm (ảnh đầu tiên là ảnh chính)
async function findImagesByProductId(productId) {
  const db = await connection;

  const sql = `
    SELECT id, image_url, public_id, sort_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order ASC, id ASC
  `;

  const [results] = await db.query(sql, [productId]);
  return results;
}

// Thêm nhiều ảnh cho sản phẩm. conn là connection đang nằm trong transaction.
async function insertImages(conn, productId, images, startOrder) {
  if (images.length === 0) {
    return;
  }

  const rows = images.map((image, index) => [
    productId,
    image.url,
    image.publicId,
    startOrder + index
  ]);

  await conn.query(
    `INSERT INTO product_images (product_id, image_url, public_id, sort_order)
     VALUES ?`,
    [rows]
  );
}

// Tạo sản phẩm kèm ảnh. images = [{ url, publicId }], ảnh đầu tiên là ảnh chính.
async function createProduct(name, price, description, images) {
  const db = await connection;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const sql = `
                INSERT INTO products(name, price, image, description)
                VALUES(?, ?, ?, ?)
              `;
    const [results] = await conn.query(sql, [
      name,
      price,
      images[0].url,
      description ?? null
    ]);

    await insertImages(conn, results.insertId, images, 0);

    await conn.commit();
    return results;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// Cập nhật sản phẩm: sửa thông tin, xóa ảnh (removeIds), thêm ảnh mới (newImages).
// products.image luôn được đồng bộ với ảnh đầu tiên còn lại.
async function updateProduct(id, name, price, description, { removeIds = [], newImages = [] } = {}) {
  const db = await connection;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const sql = `
                UPDATE products
                SET 
                    name =?,
                    price =?,
                    description = ?
                WHERE id = ?
              `;
    const [results] = await conn.query(sql, [
      name,
      price,
      description ?? null,
      id
    ]);

    if (removeIds.length > 0) {
      await conn.query(
        `DELETE FROM product_images WHERE product_id = ? AND id IN (?)`,
        [id, removeIds]
      );
    }

    if (newImages.length > 0) {
      const [orderRows] = await conn.query(
        `SELECT COALESCE(MAX(sort_order), -1) AS maxOrder
         FROM product_images
         WHERE product_id = ?`,
        [id]
      );

      await insertImages(conn, id, newImages, orderRows[0].maxOrder + 1);
    }

    // Đồng bộ ảnh chính (products.image) = ảnh đầu tiên còn lại
    const [firstRows] = await conn.query(
      `SELECT image_url
       FROM product_images
       WHERE product_id = ?
       ORDER BY sort_order ASC, id ASC
       LIMIT 1`,
      [id]
    );

    if (firstRows.length > 0) {
      await conn.query(
        `UPDATE products SET image = ? WHERE id = ?`,
        [firstRows[0].image_url, id]
      );
    }

    await conn.commit();
    return results;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

async function deleteById(id) {
  const db = await connection;
  const sql = `
              DELETE FROM products 
              WHERE id = ?
  `;

  const [results] = await db.query(sql, [id]);
  return results;
};

async function toggleFeatured(id) {
  const db = await connection;

  const sql = `
        UPDATE products
        SET is_featured = NOT is_featured
        WHERE id = ?
    `;

  const [results] = await db.query(sql, [id]);

  return results;
}

module.exports = {
  findAll,
  findFeatured,
  findById,
  findImagesByProductId,
  createProduct,
  updateProduct,
  deleteById,
  toggleFeatured
}
