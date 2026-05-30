-- 创建数据库
CREATE DATABASE IF NOT EXISTS amber_polish_dev DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE amber_polish_dev;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    role VARCHAR(50) NOT NULL COMMENT '角色：PURCHASER-采购员 POLISHER-打磨技师 CONSULTANT-定制顾问 ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志：0-未删除 1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 虫珀品类类目表
CREATE TABLE IF NOT EXISTS amber_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID，0表示顶级类目',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    category_type VARCHAR(50) COMMENT '类目类型：INSECT-远古昆虫珀 PLANT-植物包裹珀 MISC-杂料原石珀 FINISHED-成品雕件珀',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停收下架 1-正常',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志：0-未删除 1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='虫珀品类类目表';

-- 原石入库档案表
CREATE TABLE IF NOT EXISTS amber_raw_stone (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    trace_code VARCHAR(100) NOT NULL UNIQUE COMMENT '溯源编号',
    category_id BIGINT NOT NULL COMMENT '品类类目ID',
    origin VARCHAR(100) COMMENT '开采矿区',
    weight DECIMAL(10,2) COMMENT '重量/g',
    length DECIMAL(10,2) COMMENT '长度/mm',
    width DECIMAL(10,2) COMMENT '宽度/mm',
    height DECIMAL(10,2) COMMENT '高度/mm',
    inclusion_species VARCHAR(200) COMMENT '内含物种',
    clarity VARCHAR(50) COMMENT '通透品相',
    purchase_price DECIMAL(12,2) COMMENT '采购成本',
    purchaser_id BIGINT COMMENT '采购员ID',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态：PENDING-待打磨 POLISHING-打磨中 FINISHED-成品出货 SOLD-已售出',
    inspection_time DATETIME COMMENT '巡检时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志：0-未删除 1-已删除',
    INDEX idx_trace_code (trace_code),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原石入库档案表';

-- 私人定制打磨工单表
CREATE TABLE IF NOT EXISTS polish_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    raw_stone_id BIGINT NOT NULL COMMENT '原石ID',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    design_requirements TEXT COMMENT '形制设计要求',
    design_confirm_time DATETIME COMMENT '设计确认时间',
    polisher_id BIGINT COMMENT '打磨技师ID',
    start_time DATETIME COMMENT '开始时间',
    finish_time DATETIME COMMENT '完成时间',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '耗材支出',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工精工费用',
    order_amount DECIMAL(12,2) COMMENT '订单收益',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态：PENDING-待选石 DESIGN-设计确认中 GRINDING-粗磨去皮 POLISHING-精抛修边 INLAY-镶嵌配饰 DELIVERED-成品交付 CANCELLED-已取消 SHELVED-已搁置',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志：0-未删除 1-已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_raw_stone_id (raw_stone_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私人定制打磨工单表';

-- 打磨定制盈亏台账表
CREATE TABLE IF NOT EXISTS profit_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    category_id BIGINT NOT NULL COMMENT '品类ID',
    order_id BIGINT COMMENT '工单ID',
    raw_stone_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原石采购成本',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '打磨耗材支出',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工精工费用',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    order_income DECIMAL(12,2) DEFAULT 0 COMMENT '定制订单收益',
    profit_amount DECIMAL(12,2) DEFAULT 0 COMMENT '利润额',
    profit_rate DECIMAL(5,2) DEFAULT 0 COMMENT '利润率%',
    ledger_date DATE COMMENT '台账日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标志：0-未删除 1-已删除',
    INDEX idx_ledger_no (ledger_no),
    INDEX idx_category_id (category_id),
    INDEX idx_ledger_date (ledger_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打磨定制盈亏台账表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation_module VARCHAR(100) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    request_method VARCHAR(20) COMMENT '请求方法',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    execution_time BIGINT COMMENT '执行时长ms',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败 1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化管理员用户 (密码: admin123)
INSERT INTO sys_user (username, password, real_name, phone, role, status) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000', 'ADMIN', 1);

-- 初始化测试用户
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES 
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张三', '13800138001', 'PURCHASER', 1),
('polisher01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李四', '13800138002', 'POLISHER', 1),
('consultant01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王五', '13800138003', 'CONSULTANT', 1);

-- 初始化虫珀品类类目
INSERT INTO amber_category (parent_id, category_name, category_code, category_type, sort_order, status) VALUES
(0, '远古昆虫珀', 'INSECT', 'INSECT', 1, 1),
(0, '植物包裹珀', 'PLANT', 'PLANT', 2, 1),
(0, '杂料原石珀', 'MISC', 'MISC', 3, 1),
(0, '成品雕件珀', 'FINISHED', 'FINISHED', 4, 1),
(1, '琥珀虫珀', 'INSECT_AMBER', 'INSECT', 1, 1),
(1, '蓝珀虫珀', 'INSECT_BLUE', 'INSECT', 2, 1),
(2, '树叶珀', 'PLANT_LEAF', 'PLANT', 1, 1),
(2, '花朵珀', 'PLANT_FLOWER', 'PLANT', 2, 1);
