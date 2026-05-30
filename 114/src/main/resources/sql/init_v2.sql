CREATE DATABASE IF NOT EXISTS bee_equipment DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bee_equipment;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：ADMIN-管理员 ASSEMBLER-组装工 PURCHASER-采购 OPERATOR-运维',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_username (username),
    INDEX idx_role (role)
) COMMENT '用户表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    module VARCHAR(50) COMMENT '模块',
    description VARCHAR(200) COMMENT '操作描述',
    ip VARCHAR(50) COMMENT 'IP地址',
    request_url VARCHAR(255) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    cost_time BIGINT COMMENT '耗时（毫秒）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败 1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) COMMENT '操作日志表';

CREATE TABLE IF NOT EXISTS equipment_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID，0表示顶级',
    name VARCHAR(100) NOT NULL COMMENT '类目名称',
    code VARCHAR(50) UNIQUE COMMENT '类目编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架 1-上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
) COMMENT '养蜂器具类目表';

CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编号',
    name VARCHAR(100) NOT NULL COMMENT '物料名称',
    category_id BIGINT COMMENT '物料分类ID',
    spec VARCHAR(100) COMMENT '规格型号',
    origin VARCHAR(100) COMMENT '产地',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '库存数量',
    warn_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '预警数量',
    price DECIMAL(10,2) COMMENT '单价',
    is_moisture_sensitive TINYINT DEFAULT 0 COMMENT '是否易潮：0-否 1-是',
    expiry_date DATE COMMENT '有效期',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：NORMAL-正常 WARN-预警 STOP-停止采购',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_batch_no (batch_no)
) COMMENT '生产物料库存表';

CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    equipment_category_id BIGINT COMMENT '器具类目ID',
    quantity INT NOT NULL COMMENT '生产数量',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待领料 PICKED-已领料 ASSEMBLING-组装中 FINISHED-已完成 INSPECTING-质检中 DELIVERED-已配发 SUSPENDED-已暂停',
    assembler_id BIGINT COMMENT '组装工ID',
    pick_time DATETIME COMMENT '领料时间',
    finish_time DATETIME COMMENT '完成时间',
    deadline DATETIME COMMENT '截止时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_assembler_id (assembler_id)
) COMMENT '器具组装调配工单表';

CREATE TABLE IF NOT EXISTS work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    required_quantity DECIMAL(12,2) NOT NULL COMMENT '所需数量',
    actual_quantity DECIMAL(12,2) COMMENT '实际领用数量',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) COMMENT '工单物料明细表';

CREATE TABLE IF NOT EXISTS cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    equipment_category_id BIGINT COMMENT '器具类目ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '物料成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    transport_cost DECIMAL(12,2) DEFAULT 0 COMMENT '运输成本',
    loss_cost DECIMAL(12,2) DEFAULT 0 COMMENT '损耗成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '销售收入',
    profit DECIMAL(12,2) DEFAULT 0 COMMENT '利润',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_statistics_date (statistics_date),
    INDEX idx_category_id (equipment_category_id)
) COMMENT '产销成本统计表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000', 'ADMIN', 1),
('assembler01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张组装', '13800138001', 'ASSEMBLER', 1),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李采购', '13800138002', 'PURCHASER', 1),
('operator01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王运维', '13800138003', 'OPERATOR', 1);

INSERT INTO equipment_category (parent_id, name, code, sort_order, status) VALUES
(0, '实木蜂箱', 'WOOD_BEEHIVE', 1, 1),
(0, '巢脾巢础', 'COMB_FOUNDATION', 2, 1),
(0, '饲喂器具', 'FEEDING_EQUIPMENT', 3, 1),
(0, '防蜂防护用品', 'BEE_PROTECTION', 4, 1),
(1, '标准十框蜂箱', 'STANDARD_10_FRAME', 1, 1),
(1, '卧式蜂箱', 'HORIZONTAL_HIVE', 2, 1),
(1, '格子蜂箱', 'GRID_HIVE', 3, 1),
(2, '巢础框', 'FOUNDATION_FRAME', 1, 1),
(2, '巢脾', 'COMB', 2, 1),
(3, '喂糖器', 'FEEDER', 1, 1),
(3, '喂水器', 'WATERER', 2, 1),
(4, '防蜂服', 'BEE_SUIT', 1, 1),
(4, '防蜂手套', 'BEE_GLOVES', 2, 1),
(4, '防蜂面罩', 'BEE_MASK', 3, 1);

INSERT INTO material (batch_no, name, category_id, spec, origin, unit, quantity, warn_quantity, price, is_moisture_sensitive, expiry_date, status) VALUES
('BATCH-001', '松木板材', 1, '20mm*500mm*1000mm', '云南', '块', 500, 50, 85.00, 0, NULL, 'NORMAL'),
('BATCH-002', '杉木板材', 1, '15mm*400mm*800mm', '福建', '块', 800, 100, 65.00, 0, NULL, 'NORMAL'),
('BATCH-003', '蜂蜡原料', 2, '食品级', '浙江', 'kg', 200, 20, 120.00, 1, '2025-12-31', 'NORMAL'),
('BATCH-004', '不锈钢合页', 3, '2寸', '广东', '个', 2000, 200, 2.50, 0, NULL, 'NORMAL'),
('BATCH-005', '防锈螺丝', 3, 'M4*20', '江苏', '个', 5000, 500, 0.15, 0, NULL, 'NORMAL'),
('BATCH-006', '防虫网', 4, '80目', '山东', '米', 1000, 100, 5.50, 1, '2025-06-30', 'WARN'),
('BATCH-007', '铁丝网', 3, '16号', '河北', '米', 500, 50, 3.20, 0, NULL, 'STOP');
