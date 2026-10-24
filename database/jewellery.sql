-- =============================================================
-- B.unique Handmade Jewellery - Database Schema & Seed Data
-- Project : B.unique Handmade Jewellery
-- Engine  : MySQL 5.7+ / MariaDB
-- Charset : utf8mb4
-- =============================================================

CREATE DATABASE IF NOT EXISTS bunique_jewellery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bunique_jewellery;

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- Table: admins
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `zip` VARCHAR(20) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `status` ENUM('active','banned') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: categories
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: products
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `short_description` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `old_price` DECIMAL(10,2) DEFAULT NULL,
  `sku` VARCHAR(50) DEFAULT NULL,
  `stock` INT(11) NOT NULL DEFAULT 0,
  `material` VARCHAR(100) DEFAULT NULL,
  `weight` VARCHAR(50) DEFAULT NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `is_best_seller` TINYINT(1) NOT NULL DEFAULT 0,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `image` VARCHAR(255) DEFAULT NULL,
  `views` INT(11) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: product_images
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: wishlist
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user_product` (`user_id`,`product_id`),
  KEY `idx_wishlist_product` (`product_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: cart
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_user_product` (`user_id`,`product_id`),
  KEY `idx_cart_product` (`product_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: coupons
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `discount_type` ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `min_order` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `max_discount` DECIMAL(10,2) DEFAULT NULL,
  `usage_limit` INT(11) NOT NULL DEFAULT 0,
  `used_count` INT(11) NOT NULL DEFAULT 0,
  `per_user_limit` INT(11) NOT NULL DEFAULT 1,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(30) NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `coupon_id` INT(11) UNSIGNED DEFAULT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod',
  `payment_status` ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `order_status` ENUM('pending','confirmed','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  `shipping_name` VARCHAR(100) DEFAULT NULL,
  `shipping_email` VARCHAR(150) DEFAULT NULL,
  `shipping_phone` VARCHAR(20) DEFAULT NULL,
  `shipping_address` VARCHAR(255) DEFAULT NULL,
  `shipping_city` VARCHAR(100) DEFAULT NULL,
  `shipping_state` VARCHAR(100) DEFAULT NULL,
  `shipping_zip` VARCHAR(20) DEFAULT NULL,
  `shipping_country` VARCHAR(100) DEFAULT 'India',
  `notes` TEXT DEFAULT NULL,
  `review_token` VARCHAR(64) DEFAULT NULL,
  `rating_email_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: order_items
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `product_image` VARCHAR(255) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: payments
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod',
  `transaction_id` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: reviews
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `rating` TINYINT(1) NOT NULL DEFAULT 5,
  `title` VARCHAR(150) DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `status` ENUM('pending','approved') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: banners
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `position` VARCHAR(50) NOT NULL DEFAULT 'home_slider',
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: newsletter
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `newsletter`;
CREATE TABLE `newsletter` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(64) DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: contact_messages
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(200) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: settings
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: password_resets
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_email` (`email`),
  KEY `idx_password_resets_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: email_verifications
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `email_verifications`;
CREATE TABLE `email_verifications` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_verifications_user` (`user_id`),
  KEY `idx_email_verifications_token` (`token`),
  CONSTRAINT `fk_email_verifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- SEED DATA
-- =============================================================

-- Admin account (Email: admin10@gmail.com / Password: admin@#123)
INSERT INTO `admins` (`name`, `email`, `password`, `role`, `status`) VALUES
('Super Admin', 'admin10@gmail.com', '$2y$10$yLztyKVdsJYxSi8nLPFRH.wMwGGYtYC8nb1WLCt6cEpPijqXrJjBa', 'super_admin', 1);

-- Demo user account (Email: user@example.com / Password: user@123)
INSERT INTO `users` (`name`, `email`, `password`, `phone`, `email_verified_at`, `status`) VALUES
('Demo Customer', 'user@example.com', '$2y$10$fgPN0Jsn6hHxr6URCKkLb.s2LbhLJvUy5OD8.eBlhQx9gdVtnosQ.', '+91 98765 43210', NOW(), 'active');

-- Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`, `status`) VALUES
('Necklaces', 'necklaces', 'Handcrafted necklaces, chokers and statement pieces.', 1, 1),
('Earrings', 'earrings', 'Jhumkas, studs, drops and dangles for every occasion.', 2, 1),
('Bracelets', 'bracelets', 'Delicate and bold bracelets crafted with love.', 3, 1),
('Bangles', 'bangles', 'Traditional and modern bangles in gold and silver tones.', 4, 1),
('Rings', 'rings', 'Handmade rings for every finger and every mood.', 5, 1),
('Pendants', 'pendants', 'Charming pendants with intricate detailing.', 6, 1),
('Chains', 'chains', 'Fine chains in gold and silver finishes.', 7, 1),
('Anklets', 'anklets', 'Feet adornments that jingle with every step.', 8, 1);

-- Products
INSERT INTO `products` (`category_id`, `name`, `slug`, `short_description`, `description`, `price`, `old_price`, `sku`, `stock`, `material`, `weight`, `featured`, `is_new`, `is_best_seller`, `status`, `image`, `views`) VALUES
(1, 'Rose Gold Butterfly Necklace', 'rose-gold-butterfly-necklace', 'A delicate rose gold necklace with a handcrafted butterfly pendant.', 'Crafted from premium rose gold plated alloy, this butterfly pendant necklace is the perfect blend of elegance and charm. Each piece is handmade with love.', 1499.00, 1999.00, 'BU-NK-001', 25, 'Rose Gold Plated Alloy', '8 g', 1, 1, 1, 1, 'rose-gold-butterfly-necklace.jpg', 120),
(1, 'Kundan Bridal Necklace Set', 'kundan-bridal-necklace-set', 'A regal kundan necklace set fit for a bride.', 'This stunning kundan bridal set features intricate stone work and antique finish. Includes necklace and matching earrings.', 4999.00, NULL, 'BU-NK-002', 10, 'Copper with Kundan Stones', '120 g', 1, 0, 1, 1, 'kundan-bridal-necklace-set.jpg', 95),
(1, 'Boho Choker Necklace', 'boho-choker-necklace', 'A trendy boho choker with rustic charm.', 'Made with woven thread and oxidised silver accents, this choker adds a bohemian touch to any outfit.', 1199.00, 1499.00, 'BU-NK-003', 30, 'Oxidised Silver & Thread', '15 g', 0, 1, 0, 1, 'boho-choker-necklace.jpg', 67),
(2, 'Pearl Drop Earrings', 'pearl-drop-earrings', 'Classic pearl drop earrings for a timeless look.', 'Elegant artificial pearls set in gold plated studs with a graceful drop design. Perfect for weddings and parties.', 799.00, 999.00, 'BU-ER-001', 40, 'Gold Plated Alloy', '10 g', 1, 1, 1, 1, 'pearl-drop-earrings.jpg', 140),
(2, 'Oxidised Silver Jhumka', 'oxidised-silver-jhumka', 'Traditional oxidised jhumkas with a modern twist.', 'Handcrafted oxidised silver jhumkas with domed bells and intricate filigree work. Lightweight and comfortable.', 899.00, NULL, 'BU-ER-002', 35, 'Oxidised Silver', '18 g', 1, 0, 1, 1, 'oxidised-silver-jhumka.jpg', 88),
(2, 'Ruby Stud Earrings', 'ruby-stud-earrings', 'Deep red ruby studs to light up your ears.', 'Swarovski-style ruby stones in a classic solitaire setting with a silver finish.', 1099.00, 1299.00, 'BU-ER-003', 22, 'Silver Plated Alloy', '4 g', 0, 0, 0, 1, 'ruby-stud-earrings.jpg', 45),
(3, 'Stone Studded Bracelet', 'stone-studded-bracelet', 'A colourful stone studded bracelet for everyday wear.', 'A stretchable bracelet featuring colourful semi-precious stones with a gold plated charm.', 699.00, 899.00, 'BU-BR-001', 50, 'Semi-precious Stones', '12 g', 1, 1, 0, 1, 'stone-studded-bracelet.jpg', 110),
(3, 'Vintage Cuff Bracelet', 'vintage-cuff-bracelet', 'A vintage inspired open cuff bracelet.', 'Antique finish open cuff with embossed floral patterns. Adjustable to fit most wrists.', 2499.00, NULL, 'BU-BR-002', 15, 'Brass with Antique Finish', '35 g', 0, 0, 1, 1, 'vintage-cuff-bracelet.jpg', 52),
(4, 'Crystal Bangle Set', 'crystal-bangle-set', 'A set of six sparkling crystal bangles.', 'A vibrant set of six gold plated bangles embedded with sparkling crystals. Each bangle is 2.4 inches in diameter.', 1299.00, 1599.00, 'BU-BN-001', 18, 'Gold Plated Alloy', '90 g', 1, 1, 1, 1, 'crystal-bangle-set.jpg', 76),
(5, 'Emerald Leaf Ring', 'emerald-leaf-ring', 'A green emerald leaf ring that is adjustable.', 'An elegant adjustable ring with a beautiful emerald green stone and delicate leaf detailing.', 1799.00, 2199.00, 'BU-RG-001', 20, 'Silver Plated Alloy', '6 g', 1, 0, 1, 1, 'emerald-leaf-ring.jpg', 61),
(6, 'Ruby Red Pendant', 'ruby-red-pendant', 'A bold ruby red pendant on a silver chain.', 'A striking ruby red pendant with a delicate chain included. Perfect gift for someone special.', 1099.00, 1399.00, 'BU-PN-001', 28, 'Silver Plated Alloy', '11 g', 0, 1, 0, 1, 'ruby-red-pendant.jpg', 83),
(7, 'Gold Plated Rope Chain', 'gold-plated-rope-chain', 'A classic gold plated rope chain.', 'A sturdy gold plated rope chain that goes with every pendant and outfit. 20 inches long.', 999.00, 1199.00, 'BU-CH-001', 45, 'Gold Plated Alloy', '25 g', 0, 0, 0, 1, 'gold-plated-rope-chain.jpg', 39),
(8, 'Anklet with Bells', 'anklet-with-bells', 'A charming anklet with tiny bells.', 'A delicate anklet with jingling bells, perfect for traditional wear. 9 inches with adjustable extender.', 599.00, 799.00, 'BU-AN-001', 60, 'Gold Plated Alloy', '9 g', 0, 1, 1, 1, 'anklet-with-bells.jpg', 57);

-- Coupons
INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_order`, `max_discount`, `usage_limit`, `per_user_limit`, `start_date`, `end_date`, `status`) VALUES
('WELCOME10', 'percent', 10.00, 999.00, 500.00, 100, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 1),
('SAVE100', 'fixed', 100.00, 1499.00, NULL, 50, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1),
('DIWALI15', 'percent', 15.00, 1999.00, 750.00, 200, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 1);

-- Banners
INSERT INTO `banners` (`title`, `subtitle`, `link`, `position`, `sort_order`, `status`) VALUES
('Handmade Jewellery', 'Crafted with love, worn with pride', 'shop.php', 'home_slider', 1, 1),
('Festive Collection', 'Up to 30% off on kundan sets', 'category.php?slug=necklaces', 'home_slider', 2, 1),
('New Arrivals', 'Explore the latest handcrafted pieces', 'shop.php?sort=newest', 'home_slider', 3, 1);

-- Settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'B.unique Handmade Jewellery'),
('site_tagline', 'Handcrafted elegance for every occasion'),
('site_email', 'support@bunique.in'),
('site_phone', '+91 88078 83114'),
('site_whatsapp', '+91 88078 83114'),
('site_address', 'No.22(33) ambalathadayar madam street, Canteen St, opp. to adexpress, cutting, White Town, Puducherry, 605001'),
('site_logo', ''),
('site_favicon', ''),
('currency', '₹'),
('currency_code', 'INR'),
('shipping_charge', '49'),
('free_shipping_above', '999'),
('tax_percent', '0'),
('newsletter_subscribe', '1'),
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('smtp_username', ''),
('smtp_password', ''),
('smtp_secure', 'tls'),
('smtp_from_email', 'no-reply@bunique.in'),
('smtp_from_name', 'B.unique Handmade Jewellery'),
('instagram', 'https://www.instagram.com/b.unique.handmade.jewellry/'),
('whatsapp', 'https://wa.me/918807883114'),
('about_us', 'B.unique Handmade Jewellery is a small artisanal brand crafting one-of-a-kind jewellery pieces. Every product is handmade with precision, love and the finest materials.'),
('returns_days', '7');

SET FOREIGN_KEY_CHECKS = 1;
