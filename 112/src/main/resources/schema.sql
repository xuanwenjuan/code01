CREATE DATABASE IF NOT EXISTS aquascape_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aquascape_db;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    avatar VARCHAR(255),
    role_id BIGINT,
    status TINYINT DEFAULT 1 COMMENT '1-正常 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS material_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    level INT DEFAULT 1,
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '1-上架 0-下架',
    icon VARCHAR(255),
    description VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) NOT NULL UNIQUE,
    category_id BIGINT,
    material_name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    size_spec VARCHAR(100),
    quality_level VARCHAR(50),
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(12, 2) DEFAULT 0,
    stock_status TINYINT DEFAULT 1 COMMENT '1-现货 2-紧缺 3-断货',
    expiry_date DATE,
    warning_days INT DEFAULT 7,
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS custom_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(50) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address VARCHAR(255),
    scaper_id BIGINT,
    tank_size VARCHAR(50),
    design_scheme TEXT,
    total_price DECIMAL(12, 2) DEFAULT 0,
    deposit DECIMAL(12, 2) DEFAULT 0,
    order_status TINYINT DEFAULT 1 COMMENT '0-搁置 1-待确认 2-已确认 3-搭建中 4-已完成 5-已交付',
    scheme_confirm_time DATETIME,
    build_start_time DATETIME,
    build_end_time DATETIME,
    deliver_time DATETIME,
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    material_name VARCHAR(100),
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(12, 2) DEFAULT 0,
    loss_rate DECIMAL(5, 2) DEFAULT 0,
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS finance_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_no VARCHAR(50) NOT NULL UNIQUE,
    record_type TINYINT NOT NULL COMMENT '1-采购支出 2-订单收入 3-损耗成本',
    category_id BIGINT,
    category_name VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    related_order_id BIGINT,
    related_order_no VARCHAR(50),
    record_date DATE,
    operator VARCHAR(50),
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    module VARCHAR(50),
    operation VARCHAR(50),
    method VARCHAR(200),
    params TEXT,
    ip VARCHAR(50),
    status TINYINT DEFAULT 1,
    error_msg TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sys_role (role_name, role_code, description) VALUES
('造景师', 'SCAPER', '负责水族造景设计和搭建'),
('素材采购', 'PURCHASER', '负责造景素材的采购管理'),
('仓储打理', 'WAREHOUSE', '负责库存管理和素材养护'),
('平台管理', 'ADMIN', '系统管理员');

INSERT INTO sys_user (username, password, real_name, phone, role_id, status) VALUES
('admin', 'admin123', '管理员', '13800138000', 4, 1),
('scaper01', '123456', '张造景', '13800138001', 1, 1),
('buyer01', '123456', '李采购', '13800138002', 2, 1),
('keeper01', '123456', '王仓储', '13800138003', 3, 1);

INSERT INTO material_category (category_name, parent_id, level, sort, status) VALUES
('沉木素材', 0, 1, 1, 1),
('奇石石材', 0, 1, 2, 1),
('水生底砂', 0, 1, 3, 1),
('活体水草', 0, 1, 4, 1),
('紫柚木', 1, 2, 1, 1),
('流木', 1, 2, 2, 1),
('青龙石', 2, 2, 1, 1),
('松皮石', 2, 2, 2, 1),
('ADA泥', 3, 2, 1, 1),
('陶粒砂', 3, 2, 2, 1),
('前景草', 4, 2, 1, 1),
('后景草', 4, 2, 2, 1);
