-- ============================================================
-- 虚拟商品自动发卡系统 · 数据库安装脚本
-- 使用方式：在宝塔面板 → 数据库 → phpMyAdmin 中执行本文件
-- 或命令行执行：mysql -u用户名 -p密码 数据库名 < install.sql
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
-- ------------------------------------------------------------
-- 商品表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `description` TEXT NULL COMMENT '商品说明（发货内容/使用方法）',
  `price` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '售价（元）',
  `original_price` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '划线原价（可不填）',
  `category` VARCHAR(50) DEFAULT '默认' COMMENT '分类',
  `image` VARCHAR(255) DEFAULT '' COMMENT '商品图片URL（可留空）',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '当前库存（剩余卡密数）',
  `sales` INT NOT NULL DEFAULT 0 COMMENT '已售数量',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1上架 0下架',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序（越大越靠前）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
-- ------------------------------------------------------------
-- 卡密表（库存数据，发货内容）
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cards`;
CREATE TABLE `cards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL COMMENT '所属商品ID',
  `content` TEXT NOT NULL COMMENT '卡密内容（一行一条发货信息）',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0未售 1已售',
  `order_id` INT UNSIGNED DEFAULT NULL COMMENT '售出订单ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `sold_at` DATETIME DEFAULT NULL COMMENT '售出时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_status` (`product_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='卡密表';
-- ------------------------------------------------------------
-- 订单表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '商户订单号',
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `contact` VARCHAR(100) DEFAULT '' COMMENT '买家联系方式（邮箱/QQ）',
  `query_pwd` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '卡密查询密码(SHA256)，凭订单号+密码查卡',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0待支付 1已支付 2已退款',
  `trade_no` VARCHAR(64) DEFAULT '' COMMENT '支付宝交易号',
  `card_id` INT UNSIGNED DEFAULT NULL COMMENT '已发放的卡密ID',
  `notify_time` DATETIME DEFAULT NULL COMMENT '支付回调时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `paid_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
-- ------------------------------------------------------------
-- 管理员表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希（使用 password_hash 生成）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';
-- ------------------------------------------------------------
-- 站点设置表（标题、公告、支付宝配置放服务端，不入库更安全；
-- 这里存展示类配置）
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `k` VARCHAR(50) NOT NULL,
  `v` TEXT,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站点设置';
-- 说明：不在这里插入默认管理员。
-- 部署完成后，在 server 目录执行下面的命令创建管理员账号：
--   php tools/make_admin.php admin 你的密码
-- （执行完记得删除或重命名 tools/make_admin.php）
-- 默认设置
INSERT INTO `settings` (`k`, `v`) VALUES
('site_name', '发卡小店'),
('site_notice', '付款后自动发货，请留意查收。有问题联系客服。');
SET FOREIGN_KEY_CHECKS = 1;
