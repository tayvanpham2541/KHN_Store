// require("dotenv").config();
// const mysql = require("mysql2/promise");

// // const connection = mysql.createConnection({
// //     host: process.env.DB_HOST,
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASSWORD,
// //     database: process.env.DB_NAME,
// // });



// module.exports = connection;

//Test
require("dotenv").config();

const mysql = require("mysql2/promise");

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// async function testConnection() {
//     try {
//         const [rows] = await connection.query(
//             "SELECT * FROM products"
//         );

//         console.log("✅ Kết nối Aiven thành công!");
//         console.log("Số sản phẩm:", rows.length);
//         console.log(rows);
//     } catch (error) {
//         console.error("❌ Kết nối Aiven thất bại:");
//         console.error(error);
//     }
// }

// testConnection();

module.exports = connection;