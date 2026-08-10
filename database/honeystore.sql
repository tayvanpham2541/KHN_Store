
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
SET image = '/images/honey.jpg'
WHERE id = 1;

UPDATE products
SET image = '/images/royal-jelly.jpg'
WHERE id = 2;

UPDATE products
SET image = '/images/pollen.jpg'
WHERE id = 3;

