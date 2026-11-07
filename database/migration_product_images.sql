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
