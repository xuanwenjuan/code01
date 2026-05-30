CREATE DATABASE IF NOT EXISTS plastic_injection DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE plastic_injection;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role INT NOT NULL COMMENT '角色：1采购员 2技术员 3组长 4质检 5管理员',
    status INT DEFAULT 1 COMMENT '状态：0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记：0未删 1已删',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

INSERT INTO sys_user (username, password, real_name, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV.5eO', '系统管理员', 5),
('purchaser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV.5eO', '张三', 1),
('technician', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV.5eO', '李四', 2),
('leader', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV.5eO', '王五', 3),
('quality', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV.5eO', '赵六', 4);

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '优先级',
    status INT DEFAULT 1 COMMENT '状态：0下架 1上架',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品类目表';

INSERT INTO product_category (category_name, category_code, parent_id, level, sort, priority) VALUES
('家电外壳', 'HOME_APPLIANCE', 0, 1, 1, 100),
('数码配件壳体', 'DIGITAL', 0, 1, 2, 90),
('仪器防护壳', 'INSTRUMENT', 0, 1, 3, 80),
('定制异形塑件', 'CUSTOM', 0, 1, 4, 70),
('电视机外壳', 'TV_CASE', 1, 2, 1, 100),
('空调外壳', 'AC_CASE', 1, 2, 2, 95),
('手机壳', 'PHONE_CASE', 2, 2, 1, 100),
('平板壳', 'TABLET_CASE', 2, 2, 2, 95);

CREATE TABLE IF NOT EXISTS material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) NOT NULL COMMENT '原料牌号',
    brand VARCHAR(100) COMMENT '品牌',
    color VARCHAR(50) COMMENT '颜色',
    melt_index DECIMAL(10,2) COMMENT '熔融指数',
    is_hygroscopic INT DEFAULT 0 COMMENT '是否易吸潮：0否 1是',
    batch_no VARCHAR(100) NOT NULL UNIQUE COMMENT '批次号',
    quantity DECIMAL(15,2) NOT NULL COMMENT '库存数量',
    unit VARCHAR(20) DEFAULT 'KG' COMMENT '单位',
    warning_quantity DECIMAL(15,2) DEFAULT 0 COMMENT '预警数量',
    stock_status INT DEFAULT 1 COMMENT '库存状态：1充足 2预警 3停止采购',
    production_date DATE COMMENT '生产日期',
    shelf_life INT COMMENT '保质期（月）',
    expire_date DATE COMMENT '有效期至',
    warehouse_location VARCHAR(100) COMMENT '库位',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_code (material_code),
    INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

INSERT INTO material_stock (material_name, material_code, brand, color, melt_index, is_hygroscopic, batch_no, quantity, warning_quantity, warehouse_location) VALUES
('ABS原料', 'ABS-757', '奇美', '白色', 12.5, 0, 'B202401001', 5000.00, 500.00, 'A-01-01'),
('PC原料', 'PC-141R', '拜耳', '透明', 10.0, 1, 'B202401002', 3000.00, 300.00, 'A-01-02'),
('尼龙料', 'PA66-101L', '杜邦', '本色', 15.0, 1, 'B202401003', 2000.00, 200.00, 'A-02-01'),
('阻燃母粒', 'FR-800', '科莱恩', '白色', 8.0, 0, 'B202401004', 1000.00, 100.00, 'A-02-02');

CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    category_id BIGINT COMMENT '类目ID',
    plan_quantity DECIMAL(15,2) NOT NULL COMMENT '计划数量',
    actual_quantity DECIMAL(15,2) DEFAULT 0 COMMENT '实际数量',
    defective_quantity DECIMAL(15,2) DEFAULT 0 COMMENT '次品数量',
    order_status INT DEFAULT 1 COMMENT '工单状态：1待投产 2烘干中 3调试中 4注塑中 5冷却中 6修边中 7质检中 8已完成 9已延期',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    technician_id BIGINT COMMENT '技术员ID',
    technician_name VARCHAR(50) COMMENT '技术员姓名',
    machine_id BIGINT COMMENT '机台ID',
    machine_name VARCHAR(50) COMMENT '机台名称',
    drying_time INT COMMENT '烘干时间（分钟）',
    mold_install_time INT COMMENT '模具安装时间（分钟）',
    injection_cycle INT COMMENT '注塑周期（分钟）',
    cooling_time INT COMMENT '冷却时间（分钟）',
    trimming_time INT COMMENT '修边时间（分钟）',
    remark VARCHAR(500) COMMENT '备注',
    is_delayed INT DEFAULT 0 COMMENT '是否延期：0否 1是',
    delay_time DATETIME COMMENT '延期时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_order_status (order_status),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE IF NOT EXISTS order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料牌号',
    batch_no VARCHAR(100) COMMENT '批次号',
    plan_quantity DECIMAL(15,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(15,2) COMMENT '实际用量',
    unit VARCHAR(20) DEFAULT 'KG' COMMENT '单位',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料表';

CREATE TABLE IF NOT EXISTS cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    category_id BIGINT COMMENT '类目ID',
    category_name VARCHAR(100) COMMENT '类目名称',
    production_quantity DECIMAL(15,2) COMMENT '生产数量',
    material_cost DECIMAL(15,2) COMMENT '原料成本',
    machine_cost DECIMAL(15,2) COMMENT '机台能耗成本',
    labor_cost DECIMAL(15,2) COMMENT '人工成本',
    defective_cost DECIMAL(15,2) COMMENT '次品损耗成本',
    total_cost DECIMAL(15,2) COMMENT '总成本',
    unit_cost DECIMAL(15,2) COMMENT '单位成本',
    sales_price DECIMAL(15,2) COMMENT '销售单价',
    gross_profit DECIMAL(15,2) COMMENT '毛利',
    gross_profit_margin DECIMAL(10,4) COMMENT '毛利率',
    accounting_date DATE COMMENT '核算日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_id (order_id),
    INDEX idx_category_id (category_id),
    INDEX idx_accounting_date (accounting_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';
