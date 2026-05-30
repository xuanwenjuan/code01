-- =============================================
-- 工业民用消防器材生产管控系统数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS fire_equipment_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE fire_equipment_db;

-- =============================================
-- 系统用户表
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    avatar VARCHAR(255) COMMENT '头像',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- =============================================
-- 系统角色表
-- =============================================
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
    role_sort INT COMMENT '角色排序',
    remark VARCHAR(500) COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- =============================================
-- 操作日志表
-- =============================================
DROP TABLE IF EXISTS sys_operation_log;
CREATE TABLE sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(100) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    description VARCHAR(500) COMMENT '描述',
    method VARCHAR(200) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    cost_time BIGINT COMMENT '耗时(毫秒)',
    status TINYINT DEFAULT 1 COMMENT '状态 0-失败 1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- =============================================
-- 产品分类表
-- =============================================
DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    category_level INT NOT NULL COMMENT '分类层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    unit VARCHAR(20) COMMENT '计量单位',
    standard_price DECIMAL(12,2) COMMENT '标准单价',
    production_cycle INT COMMENT '生产周期(天)',
    priority INT DEFAULT 0 COMMENT '生产优先级',
    status TINYINT DEFAULT 1 COMMENT '状态 0-淘汰停止排产 1-正常',
    specification VARCHAR(200) COMMENT '规格型号',
    fire_rating VARCHAR(50) COMMENT '防火等级',
    usage_scenario VARCHAR(200) COMMENT '使用场景',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_category_code (category_code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- =============================================
-- 主材物资表
-- =============================================
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    material_type VARCHAR(50) COMMENT '物资类型',
    material_texture VARCHAR(100) COMMENT '材质',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    unit_price DECIMAL(12,2) NOT NULL COMMENT '单价',
    total_stock DECIMAL(12,2) DEFAULT 0 COMMENT '总库存',
    available_stock DECIMAL(12,2) DEFAULT 0 COMMENT '可用库存',
    warning_stock DECIMAL(12,2) DEFAULT 0 COMMENT '预警库存',
    frozen_stock DECIMAL(12,2) DEFAULT 0 COMMENT '冻结库存',
    stock_status TINYINT DEFAULT 1 COMMENT '库存状态 1-正常可用 2-库存紧急预警',
    purchase_status TINYINT DEFAULT 1 COMMENT '采购状态 1-正常采购 2-停止采购',
    supplier VARCHAR(200) COMMENT '供应商',
    last_purchase_date DATE COMMENT '最近采购日期',
    recheck_cycle_days INT COMMENT '复检周期(天)',
    next_recheck_date DATE COMMENT '下次复检日期',
    is_pressure_bearing TINYINT DEFAULT 0 COMMENT '是否承压金属 0-否 1-是',
    storage_location VARCHAR(200) COMMENT '存放位置',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_material_code (material_code),
    INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='主材物资表';

-- =============================================
-- 物资批次表
-- =============================================
DROP TABLE IF EXISTS material_batch;
CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_code VARCHAR(100) NOT NULL COMMENT '批次码',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    available_quantity DECIMAL(12,2) NOT NULL COMMENT '可用数量',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期至',
    quality_status TINYINT DEFAULT 1 COMMENT '质检状态 0-待检 1-合格 2-不合格',
    inspection_report VARCHAR(500) COMMENT '质检报告',
    recheck_date DATE COMMENT '复检日期',
    recheck_status TINYINT DEFAULT 0 COMMENT '复检状态 0-待复检 1-已复检 2-复检不合格',
    supplier VARCHAR(200) COMMENT '供应商',
    warehouse_location VARCHAR(200) COMMENT '库位',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_batch_code (batch_code),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资批次表';

-- =============================================
-- 生产工单表
-- =============================================
DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    product_code VARCHAR(50) NOT NULL COMMENT '产品编码',
    specification VARCHAR(200) COMMENT '规格型号',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划数量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际数量',
    qualified_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '合格数量',
    scrap_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '报废数量',
    status TINYINT DEFAULT 0 COMMENT '工单状态 0-草稿 1-待投产 2-生产中 3-质检中 4-已完成 5-已暂停 6-已取消',
    audit_status TINYINT DEFAULT 0 COMMENT '审核状态 0-待审核 1-审核通过 2-审核驳回',
    audit_user_id BIGINT COMMENT '审核人ID',
    audit_user_name VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(500) COMMENT '审核备注',
    priority INT DEFAULT 0 COMMENT '优先级',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    process_user_id BIGINT COMMENT '工艺编制人ID',
    process_user_name VARCHAR(50) COMMENT '工艺编制人',
    production_user_id BIGINT COMMENT '生产主管ID',
    production_user_name VARCHAR(50) COMMENT '生产主管',
    quality_user_id BIGINT COMMENT '质检人ID',
    quality_user_name VARCHAR(50) COMMENT '质检人',
    current_process VARCHAR(100) COMMENT '当前工序',
    is_emergency TINYINT DEFAULT 0 COMMENT '是否应急订单 0-否 1-是',
    auto_paused TINYINT DEFAULT 0 COMMENT '是否自动暂停 0-否 1-是',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- =============================================
-- 工单工序表
-- =============================================
DROP TABLE IF EXISTS work_order_process;
CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_sort INT NOT NULL COMMENT '工序排序',
    status TINYINT DEFAULT 0 COMMENT '状态 0-未开始 1-进行中 2-已完成',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人',
    operation_content TEXT COMMENT '操作内容',
    inspection_result VARCHAR(500) COMMENT '检验结果',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_sort (process_sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

-- =============================================
-- 工单物料表
-- =============================================
DROP TABLE IF EXISTS work_order_material;
CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) NOT NULL COMMENT '单位',
    required_quantity DECIMAL(12,2) NOT NULL COMMENT '需求数量',
    picked_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '已领料数量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    returned_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '退库数量',
    scrap_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '报废数量',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料表';

-- =============================================
-- 生产成本表
-- =============================================
DROP TABLE IF EXISTS production_cost;
CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    cost_no VARCHAR(50) NOT NULL COMMENT '成本单号',
    work_order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    category_name VARCHAR(100) COMMENT '产品分类',
    production_quantity DECIMAL(12,2) COMMENT '生产数量',
    qualified_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '合格数量',
    scrap_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '报废数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '主材成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备损耗',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '水电能耗',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时',
    quality_cost DECIMAL(12,2) DEFAULT 0 COMMENT '质检成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位成本',
    material_cost_ratio DECIMAL(10,4) COMMENT '主材成本占比(%)',
    labor_cost_ratio DECIMAL(10,4) COMMENT '人工成本占比(%)',
    scrap_rate DECIMAL(10,4) COMMENT '报废率(%)',
    cost_date DATE COMMENT '成本日期',
    cost_period VARCHAR(20) COMMENT '成本期间',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_cost_no (cost_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_cost_period (cost_period),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- =============================================
-- 初始化数据
-- =============================================

-- 插入角色数据
INSERT INTO sys_role (id, role_name, role_code, role_sort, status, create_time) VALUES
(1, '系统管理员', 'ADMIN', 1, 1, NOW()),
(2, '物资采购', 'PURCHASE', 2, 1, NOW()),
(3, '工艺编制', 'PROCESS', 3, 1, NOW()),
(4, '生产主管', 'PRODUCTION', 4, 1, NOW()),
(5, '安全质检', 'QUALITY', 5, 1, NOW());

-- 插入用户数据（密码：123456，BCrypt加密）
INSERT INTO sys_user (id, username, password, real_name, phone, role_id, status, create_time) VALUES
(1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 1, 1, NOW()),
(2, 'purchase', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '采购专员', '13800138001', 2, 1, NOW()),
(3, 'process', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '工艺工程师', '13800138002', 3, 1, NOW()),
(4, 'production', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '生产主管', '13800138003', 4, 1, NOW()),
(5, 'quality', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '质检专员', '13800138004', 5, 1, NOW());

-- 插入产品分类数据
INSERT INTO product_category (id, category_name, category_code, parent_id, category_level, sort_order, unit, standard_price, production_cycle, priority, status, specification, fire_rating, usage_scenario, create_time) VALUES
(1, '灭火器材', 'FIRE_EXTINGUISHER', 0, 1, 1, '具', NULL, 15, 1, 1, NULL, 'A/B/C类', '通用消防', NOW()),
(2, '应急逃生器材', 'ESCAPE_EQUIPMENT', 0, 1, 2, '套', NULL, 10, 2, 1, NULL, '防火阻燃', '应急逃生', NOW()),
(3, '消防报警设备', 'ALARM_EQUIPMENT', 0, 1, 3, '台', NULL, 7, 1, 1, NULL, '防爆', '火灾预警', NOW()),
(4, '防火防护器材', 'PROTECTION_EQUIPMENT', 0, 1, 4, '件', NULL, 5, 3, 1, NULL, '耐高温', '个人防护', NOW()),
(5, '干粉灭火器', 'POWDER_EXT', 1, 2, 1, '具', 85.00, 15, 1, 1, 'MFZ/ABC4', 'A/B/C类', '工厂、写字楼', NOW()),
(6, '二氧化碳灭火器', 'CO2_EXT', 1, 2, 2, '具', 180.00, 18, 2, 1, 'MT/3', 'B/C/E类', '机房、配电室', NOW()),
(7, '灭火毯', 'FIRE_BLANKET', 2, 2, 1, '条', 65.00, 5, 1, 1, '1.5m×1.5m', '阻燃', '厨房、家庭', NOW()),
(8, '烟感探测器', 'SMOKE_DETECTOR', 3, 2, 1, '个', 120.00, 7, 1, 1, 'JTY-GD', '光电感烟', '办公楼、酒店', NOW()),
(9, '消防防护服', 'FIRE_SUIT', 4, 2, 1, '套', 580.00, 10, 1, 1, 'XF-01', '耐温500℃', '消防员装备', NOW());

-- 插入主材物资数据
INSERT INTO material (id, material_code, material_name, material_type, material_texture, specification, unit, unit_price, total_stock, available_stock, warning_stock, stock_status, purchase_status, supplier, recheck_cycle_days, is_pressure_bearing, storage_location, create_time) VALUES
(1, 'MAT-001', 'ABC干粉原料', '灭火剂原料', '碳酸氢钠+磷酸二氢铵', '50kg/袋', 'kg', 8.50, 5000.00, 5000.00, 500.00, 1, 1, '山东干粉厂', NULL, 0, 'A区-01', NOW()),
(2, 'MAT-002', '二氧化碳', '灭火剂原料', '液态CO2', '食品级', 'kg', 12.00, 2000.00, 2000.00, 300.00, 1, 1, '上海气体厂', NULL, 0, 'A区-02', NOW()),
(3, 'MAT-003', '合金钢罐体', '金属罐体', '锰钢合金钢', '2mm厚度', '个', 45.00, 800.00, 800.00, 100.00, 1, 1, '江苏五金厂', 180, 1, 'B区-01', NOW()),
(4, 'MAT-004', '碳钢阀门', '耐压阀门', '铸钢WCB', 'DN15', '个', 28.00, 1200.00, 1200.00, 150.00, 1, 1, '浙江阀门厂', 365, 1, 'B区-02', NOW()),
(5, 'MAT-005', '玻璃纤维面料', '阻燃面料', '玻璃纤维+硅树脂', '300g/㎡', '米', 35.00, 3000.00, 3000.00, 400.00, 1, 1, '广东纺织厂', NULL, 0, 'C区-01', NOW()),
(6, 'MAT-006', '硅橡胶密封圈', '密封辅料', '甲基乙烯基硅橡胶', 'Φ50×3', '个', 2.50, 5000.00, 5000.00, 800.00, 1, 1, '福建橡胶厂', NULL, 0, 'C区-02', NOW()),
(7, 'MAT-007', '压力表', '仪表配件', '铜合金+不锈钢', 'Y-60 2.5MPa', '个', 18.00, 600.00, 600.00, 80.00, 1, 1, '上海仪表厂', 365, 1, 'D区-01', NOW()),
(8, 'MAT-008', '喷塑粉末', '表面处理', '环氧树脂聚酯', '红色环氧', 'kg', 22.00, 800.00, 800.00, 100.00, 1, 1, '东莞涂料厂', NULL, 0, 'D区-02', NOW());

-- =============================================
-- 库存变动记录表
-- =============================================
DROP TABLE IF EXISTS material_stock_record;
CREATE TABLE material_stock_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    record_no VARCHAR(50) NOT NULL COMMENT '记录编号',
    record_type TINYINT NOT NULL COMMENT '记录类型 1-入库 2-出库 3-退库',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    batch_id BIGINT COMMENT '批次ID',
    batch_code VARCHAR(50) COMMENT '批次编码',
    quantity DECIMAL(12,2) NOT NULL COMMENT '变动数量',
    before_quantity DECIMAL(12,2) COMMENT '变动前数量',
    after_quantity DECIMAL(12,2) COMMENT '变动后数量',
    work_order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单号',
    operator_name VARCHAR(50) COMMENT '操作人',
    operate_time DATETIME COMMENT '操作时间',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_record_no (record_no),
    INDEX idx_material_id (material_id),
    INDEX idx_record_type (record_type),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存变动记录表';

-- =============================================
-- 工单工时记录表
-- =============================================
DROP TABLE IF EXISTS work_order_labor;
CREATE TABLE work_order_labor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    process_code VARCHAR(50) COMMENT '工序编码',
    process_name VARCHAR(100) COMMENT '工序名称',
    worker_id BIGINT COMMENT '工人ID',
    worker_name VARCHAR(50) COMMENT '工人姓名',
    work_hours DECIMAL(10,2) NOT NULL COMMENT '工时(小时)',
    hourly_rate DECIMAL(10,2) NOT NULL COMMENT '小时费率',
    labor_cost DECIMAL(12,2) COMMENT '人工成本',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_worker_id (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工时记录表';
