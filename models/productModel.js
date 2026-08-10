const connection = require("../config/db");

async function findAll(search = "") {
  const db = await connection;
  const sql = `SELECT *
               FROM products
               WHERE name LIKE ?`

  const [results] = await db.query(sql, [`%${search}%`]);
  return results;
};

async function findById(id) {
  const db = await connection;
  const sql = `SELECT *
               FROM products
               WHERE id = ?`
  const [results] = await db.query(sql, [id]);
  return results[0];
};

async function createProduct(name, price, image, description) {
  const db = await connection;
  const sql = `
                INSERT INTO products(name, price, image, description)
                VALUES(?, ?, ?, ?)
              `;
  const [results] = await db.execute(sql, [
    name,
    price,
    image,
    description
  ]);
  return results;
};

async function updateProduct(id, name, price, image, description) {
  const db = await connection;
  const sql = `
                UPDATE products
                SET 
                    name =?,
                    price =?,
                    image = ?,
                    description = ?
                WHERE id = ?
              `;
  const [results] = await db.query(sql, [
    name,
    price,
    image,
    description,
    id
  ]);
  return results
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


module.exports = {
  findAll,
  findById,
  createProduct,
  updateProduct,
  deleteById
}