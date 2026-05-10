CREATE DATABASE IF NOT EXISTS pet_shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pet_shop;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT DEFAULT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    unit VARCHAR(50) DEFAULT '个',
    description TEXT,
    quality_level ENUM('普通', '优质', '精品', '特级') DEFAULT '普通',
    warranty_period INT DEFAULT 0,
    manufacturing_date DATE,
    expiry_date DATE,
    supplier VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('入库', '售卖', '残次下架') NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id INT,
    detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, parent_id, description) VALUES 
('食品类', NULL, '宠物食品'),
('洗护类', NULL, '宠物洗护用品'),
('玩具类', NULL, '宠物玩具'),
('服饰类', NULL, '宠物服饰'),
('医疗类', NULL, '宠物医疗用品');

INSERT INTO categories (name, parent_id, description) VALUES 
('狗粮', 1, '狗狗专用粮'),
('猫粮', 1, '猫咪专用粮'),
('零食', 1, '宠物零食'),
('沐浴露', 2, '宠物沐浴产品'),
('美容工具', 2, '宠物美容用品'),
('互动玩具', 3, '互动型玩具'),
('啃咬玩具', 3, '啃咬型玩具'),
('衣服', 4, '宠物衣服'),
('鞋子', 4, '宠物鞋子'),
('药品', 5, '宠物药品'),
('保健品', 5, '宠物保健品');

INSERT INTO products (name, category_id, price, cost_price, stock, min_stock, unit, description, quality_level, supplier) VALUES 
('皇家狗粮 2kg', 6, 198.00, 120.00, 50, 20, '袋', '高品质狗粮', '优质', '皇家宠物食品公司'),
('渴望猫粮 1.8kg', 7, 258.00, 160.00, 30, 15, '袋', '进口猫粮', '精品', '渴望官方'),
('鸡肉干零食 100g', 8, 35.00, 18.00, 100, 30, '包', '天然鸡肉干', '优质', '本地供应商'),
('狗狗沐浴露 500ml', 9, 68.00, 35.00, 40, 10, '瓶', '温和配方', '普通', '宠物护理公司'),
('猫梳子', 10, 45.00, 22.00, 60, 15, '把', '除毛梳', '普通', '宠物用品厂'),
('逗猫棒', 11, 15.00, 5.00, 200, 50, '个', '羽毛逗猫棒', '普通', '玩具厂'),
('磨牙棒', 12, 20.00, 8.00, 150, 30, '根', '耐咬磨牙棒', '优质', '宠物玩具公司'),
('狗狗衣服', 13, 88.00, 40.00, 25, 10, '件', '冬季保暖衣', '精品', '服装公司'),
('宠物鞋子', 14, 58.00, 25.00, 30, 10, '双', '防滑鞋子', '普通', '鞋厂'),
('驱虫药', 15, 120.00, 70.00, 40, 20, '盒', '体内外驱虫', '优质', '医药公司'),
('钙片', 16, 65.00, 30.00, 80, 20, '瓶', '宠物钙片', '优质', '保健品公司');
