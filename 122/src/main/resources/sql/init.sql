CREATE DATABASE IF NOT EXISTS leather_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE leather_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：PURCHASER-采购员 TANNER-鞣制师傅 CUTTER-裁剪技工 ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除 1-已删除'
) COMMENT '用户表';

CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID，0表示顶级',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停产下架 1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '皮具款式类目表';

CREATE TABLE material_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编号',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型：LEATHER-原皮 TANNING-鞣剂 OIL-油脂 HARDWARE-五金',
    spec VARCHAR(200) COMMENT '规格',
    origin VARCHAR(100) COMMENT '产地',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    status VARCHAR(20) DEFAULT 'SUFFICIENT' COMMENT '库存状态：SUFFICIENT-充足 WARNING-预警 STOPPED-停止采购',
    warning_quantity DECIMAL(10,2) COMMENT '预警数量',
    expire_date DATE COMMENT '到期日期（生皮防腐）',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '原皮辅料库存表';

CREATE TABLE processing_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_batch_no VARCHAR(50) COMMENT '物料批次号',
    product_category_id BIGINT COMMENT '产品类目ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '加工数量',
    unit VARCHAR(20) COMMENT '单位',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待处理 SOFTENING-软化脱脂 TANNING-浸泡鞣制 DRYING-风干定型 COLORING-调色养护 CUTTING-裁剪缝制 QC-质检 FINISHED-已完成 SUSPENDED-已暂停',
    tanner_id BIGINT COMMENT '鞣制师傅ID',
    cutter_id BIGINT COMMENT '裁剪技工ID',
    soften_start_time DATETIME COMMENT '软化开始时间',
    soften_end_time DATETIME COMMENT '软化结束时间',
    tanning_start_time DATETIME COMMENT '鞣制开始时间',
    tanning_end_time DATETIME COMMENT '鞣制结束时间',
    drying_start_time DATETIME COMMENT '风干开始时间',
    drying_end_time DATETIME COMMENT '风干结束时间',
    coloring_start_time DATETIME COMMENT '调色开始时间',
    coloring_end_time DATETIME COMMENT '调色结束时间',
    cutting_start_time DATETIME COMMENT '裁剪开始时间',
    cutting_end_time DATETIME COMMENT '裁剪结束时间',
    qc_start_time DATETIME COMMENT '质检开始时间',
    qc_end_time DATETIME COMMENT '质检结束时间',
    expect_finish_time DATETIME COMMENT '预计完成时间',
    actual_finish_time DATETIME COMMENT '实际完成时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '兽皮鞣制加工工单表';

CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_batch_no VARCHAR(50) COMMENT '物料批次号',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '工单用料明细表';

CREATE TABLE profit_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    product_category_id BIGINT COMMENT '产品类目ID',
    product_category_name VARCHAR(100) COMMENT '产品类目名称',
    quantity INT COMMENT '成品数量',
    leather_cost DECIMAL(12,2) COMMENT '原皮采购成本',
    material_cost DECIMAL(12,2) COMMENT '耗材费用',
    labor_cost DECIMAL(12,2) COMMENT '人工工时费用',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    selling_price DECIMAL(12,2) COMMENT '销售总价',
    profit DECIMAL(12,2) COMMENT '利润',
    profit_rate DECIMAL(5,2) COMMENT '利润率',
    stat_date DATE COMMENT '统计日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '皮具制作盈利台账表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    request_url VARCHAR(200) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)'
) COMMENT '操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000', 'ADMIN'),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张采购', '13800138001', 'PURCHASER'),
('tanner01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李师傅', '13800138002', 'TANNER'),
('cutter01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王技工', '13800138003', 'CUTTER');

INSERT INTO product_category (parent_id, category_name, category_code, sort_order) VALUES
(0, '复古皮包', 'BAG', 1),
(0, '手工腰带', 'BELT', 2),
(0, '民俗皮靴', 'BOOT', 3),
(0, '配饰皮件', 'ACCESSORY', 4),
(1, '商务公文包', 'BAG_BUSINESS', 1),
(1, '复古单肩包', 'BAG_SHOULDER', 2),
(1, '手拿钱包', 'BAG_WALLET', 3),
(2, '针扣腰带', 'BELT_PIN', 1),
(2, '板扣腰带', 'BELT_PLATE', 2),
(3, '高筒皮靴', 'BOOT_HIGH', 1),
(3, '短筒皮靴', 'BOOT_SHORT', 2),
(4, '皮手环', 'ACCESSORY_BRACELET', 1),
(4, '皮项链', 'ACCESSORY_NECKLACE', 2);
