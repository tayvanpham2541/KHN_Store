const connection = require("../config/db");

async function findByUsername(username) {
  const db = await connection;
  const sql = `SELECT *
               FROM users
               WHERE username = ?`;

  const [row] = await db.query(sql, [username]);
  return row;
}

module.exports={findByUsername}