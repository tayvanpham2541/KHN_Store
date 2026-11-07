
CREATE DATABASE IF NOT EXISTS honeystore;
USE honeystore;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `stock` int DEFAULT '0',
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `products` WRITE;
INSERT INTO `products` VALUES (1,'Mật ong hoa cà phê',200000.00,'Mật ong nguyên chất từ hoa cà phê',100,'honey.jpg',1,'2026-07-21 20:53:51','2026-07-21 20:53:51'),(2,'Sữa ong chúa',500000.00,'Sữa ong chúa nguyên chất',50,'royal-jelly.jpg',1,'2026-07-21 20:53:51','2026-07-21 20:53:51'),(3,'Phấn hoa',300000.00,'Phấn hoa tự nhiên',30,'pollen.jpg',1,'2026-07-21 20:53:51','2026-07-21 20:53:51');
UNLOCK TABLES;

UPDATE products
SET image = 'honey.jpg'
WHERE id = 1;

UPDATE products
SET image = 'royal-jelly.jpg'
WHERE id = 2;

UPDATE products
SET image = 'pollen.jpg'
WHERE id = 3;

SELECT * FROM products
WHERE id = 7;

ALTER TABLE products
ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0
AFTER is_active;
DESCRIBE products;

UPDATE products
SET is_featured = 1
WHERE id IN (1, 3, 5);

SELECT id, name, is_active, is_featured
FROM products;

SELECT * FROM users;
INSERT INTO users(username, password)
VALUES('admin','123456');

UPDATE users
SET password = '$2b$10$gcqAA9R4WTLUIRdNvgWhh.tEs/JxbdOZmJrczYhaiSQIwp8DwkFJ6'
WHERE username = 'admin';

-- Chức năng nhiều ảnh cho mỗi sản phẩm
-- Chạy file này MỘT LẦN trên database honeystore trước khi chạy code mới.

USE honeystore;

CREATE TABLE IF NOT EXISTS product_images (
  id          INT NOT NULL AUTO_INCREMENT,
  product_id  INT NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  public_id   VARCHAR(255) DEFAULT NULL,      -- public_id trên Cloudinary, dùng để xóa ảnh
  sort_order  INT NOT NULL DEFAULT 0,         -- thứ tự hiển thị, 0 là ảnh chính
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product (product_id, sort_order),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chuyển ảnh hiện có (products.image) thành ảnh đầu tiên trong bộ sưu tập.
-- Chạy lại nhiều lần vẫn an toàn: sản phẩm đã có ảnh trong product_images sẽ bị bỏ qua.
INSERT INTO product_images (product_id, image_url, sort_order)
SELECT p.id, p.image, 0
FROM products p
WHERE p.image IS NOT NULL
  AND p.image <> ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
  );
