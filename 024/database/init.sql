CREATE DATABASE IF NOT EXISTS smart_store DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_store;

DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS inventory_records;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  parent_id INT DEFAULT NULL COMMENT '父分类ID',
  description TEXT COMMENT '分类描述',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  barcode VARCHAR(50) UNIQUE COMMENT '商品条码',
  category_id INT COMMENT '分类ID',
  brand VARCHAR(100) COMMENT '品牌',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '售价',
  cost_price DECIMAL(10, 2) DEFAULT 0 COMMENT '成本价',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存',
  unit VARCHAR(20) DEFAULT '件' COMMENT '单位',
  description TEXT COMMENT '商品描述',
  image_url VARCHAR(500) COMMENT '图片URL',
  expiry_date DATE COMMENT '保质期截止日期',
  production_date DATE COMMENT '生产日期',
  shelf_life_days INT COMMENT '保质期天数',
  supplier VARCHAR(200) COMMENT '供应商',
  purchase_price DECIMAL(10, 2) DEFAULT 0 COMMENT '进货价',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态:active/inactive',
  weight DECIMAL(10, 2) COMMENT '重量/容量',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息表';

CREATE TABLE inventory_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL COMMENT '商品ID',
  operation_type ENUM('inbound', 'sale', 'offline') NOT NULL COMMENT '操作类型:inbound入库/sale销售/offline下架',
  quantity INT NOT NULL COMMENT '数量',
  before_stock INT COMMENT '操作前库存',
  after_stock INT COMMENT '操作后库存',
  supplier VARCHAR(200) COMMENT '供应商(入库)',
  unit_price DECIMAL(10, 2) COMMENT '单价',
  amount DECIMAL(12, 2) COMMENT '总金额',
  reason VARCHAR(100) COMMENT '下架原因',
  remark TEXT COMMENT '备注',
  operator VARCHAR(100) DEFAULT '系统' COMMENT '操作人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_type (operation_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存操作记录表';

CREATE TABLE operation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL COMMENT '操作类型:分类管理/商品管理/出入库管理',
  action VARCHAR(50) NOT NULL COMMENT '操作动作:新增/修改/删除/入库/销售/下架',
  target VARCHAR(200) COMMENT '操作目标',
  details TEXT COMMENT '操作详情',
  operator VARCHAR(100) DEFAULT '系统' COMMENT '操作人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作履历表';

INSERT INTO categories (name, parent_id, description, sort_order) VALUES
('零食类', NULL, '各类零食食品', 1),
('饮品类', NULL, '各类饮料饮品', 2),
('文具类', NULL, '各类文具用品', 3),
('日用类', NULL, '各类日用品', 4),
('速食类', NULL, '各类速食食品', 5),
('膨化食品', 1, '薯片、虾条等', 1),
('糖果巧克力', 1, '糖果、巧克力等', 2),
('饼干糕点', 1, '饼干、糕点等', 3),
('碳酸饮料', 2, '可乐、雪碧等', 1),
('果汁饮料', 2, '果汁、果茶等', 2),
('茶饮', 2, '奶茶、乌龙茶等', 3),
('水', 2, '矿泉水、纯净水等', 4),
('笔类', 3, '各种笔', 1),
('本册', 3, '笔记本、作业本等', 2),
('工具', 3, '尺子、剪刀、胶带等', 3),
('洗护用品', 4, '洗发水、沐浴露等', 1),
('清洁用品', 4, '纸巾、垃圾袋等', 2),
('方便面', 5, '方便面、泡面等', 1),
('自热食品', 5, '自热米饭、火锅等', 2),
('面包', 5, '面包、三明治等', 3);

INSERT INTO products (name, barcode, category_id, brand, price, cost_price, stock, unit, description, status) VALUES
('乐事薯片原味', '6900000100101', 6, '乐事', 8.50, 5.50, 50, '袋', '经典原味薯片', 'active'),
('可口可乐330ml', '6900000100201', 9, '可口可乐', 3.00, 1.80, 100, '罐', '经典可乐', 'active'),
('康师傅红烧牛肉面', '6900000100301', 18, '康师傅', 4.50, 2.80, 80, '袋', '经典红烧牛肉面', 'active'),
('晨光中性笔0.5', '6900000100401', 13, '晨光', 2.00, 0.80, 200, '支', '黑色中性笔', 'active'),
('维达抽纸150抽', '6900000100501', 17, '维达', 5.50, 3.20, 30, '包', '3层抽纸', 'active'),
('德芙巧克力丝滑', '6900000100601', 7, '德芙', 12.00, 7.50, 40, '块', '丝滑牛奶巧克力', 'active'),
('统一阿萨姆奶茶', '6900000100701', 11, '统一', 4.50, 2.50, 60, '瓶', '原味奶茶', 'active'),
('农夫山泉550ml', '6900000100801', 12, '农夫山泉', 2.00, 1.00, 150, '瓶', '天然矿泉水', 'active'),
('得力笔记本A5', '6900000100901', 14, '得力', 10.00, 5.00, 25, '本', '80页笔记本', 'active'),
('自嗨锅麻辣牛肉', '6900000101001', 19, '自嗨锅', 35.00, 20.00, 20, '盒', '自热麻辣牛肉火锅', 'active');
