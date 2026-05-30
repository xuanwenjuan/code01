-- 休闲零食分装加工管控系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS snack_processing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE snack_processing;

-- 1. 用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-采购员 2-工艺员 3-生产组长 4-品控员 5-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    avatar VARCHAR(255) COMMENT '头像',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除 1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 2. 操作日志表
DROP TABLE IF EXISTS sys_operation_log;
CREATE TABLE sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作',
    description VARCHAR(200) COMMENT '描述',
    method VARCHAR(200) COMMENT '方法',
    request_url VARCHAR(255) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    ip VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败 1-成功',
    error_msg VARCHAR(500) COMMENT '错误信息',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_user_id (user_id),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 3. 零食品类表
DROP TABLE IF EXISTS snack_category;
CREATE TABLE snack_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '品类名称',
    code VARCHAR(50) UNIQUE COMMENT '品类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level TINYINT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '订单优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-淘汰停用 1-正常',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='零食品类表';

-- 4. 原辅材料表
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '材料名称',
    code VARCHAR(50) UNIQUE COMMENT '材料编码',
    category_id BIGINT COMMENT '所属分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    unit VARCHAR(20) COMMENT '单位',
    spec VARCHAR(100) COMMENT '规格',
    warning_stock DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    max_stock DECIMAL(10,2) DEFAULT 0 COMMENT '最大库存',
    is_fresh TINYINT DEFAULT 0 COMMENT '是否生鲜：0-否 1-是',
    shelf_life_days INT COMMENT '保质期天数',
    supplier VARCHAR(100) COMMENT '供应商',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁止采购 1-正常',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_code (code),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原辅材料表';

-- 5. 材料库存表
DROP TABLE IF EXISTS material_stock;
CREATE TABLE material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_id BIGINT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) COMMENT '材料名称',
    material_code VARCHAR(50) COMMENT '材料编码',
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '批次号',
    total_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '总数量',
    available_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '可用数量',
    locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '锁定数量',
    used_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已用数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    production_date DATE COMMENT '生产日期',
    expire_date DATE COMMENT '到期日期',
    is_expiring TINYINT DEFAULT 0 COMMENT '是否临期：0-否 1-是',
    stock_status TINYINT DEFAULT 1 COMMENT '库存状态：1-正常 2-库存预警 3-已过期',
    warehouse VARCHAR(50) COMMENT '仓库',
    location VARCHAR(50) COMMENT '库位',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_expire_date (expire_date),
    INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='材料库存表';

-- 6. 生产工单表
DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    snack_category_id BIGINT COMMENT '零食品类ID',
    snack_category_name VARCHAR(100) COMMENT '零食品类名称',
    product_name VARCHAR(100) COMMENT '产品名称',
    plan_quantity DECIMAL(10,2) COMMENT '计划产量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际产量',
    unit VARCHAR(20) COMMENT '单位',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    current_process VARCHAR(50) COMMENT '当前工序',
    process_order VARCHAR(500) COMMENT '工序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待生产 2-生产中 3-已暂停 4-质检中 5-已完成 6-已取消',
    priority INT DEFAULT 0 COMMENT '优先级',
    process_enginner_id BIGINT COMMENT '工艺员ID',
    process_enginner_name VARCHAR(50) COMMENT '工艺员姓名',
    production_leader_id BIGINT COMMENT '生产组长ID',
    production_leader_name VARCHAR(50) COMMENT '生产组长姓名',
    qc_inspector_id BIGINT COMMENT '品控员ID',
    qc_inspector_name VARCHAR(50) COMMENT '品控员姓名',
    is_overdue TINYINT DEFAULT 0 COMMENT '是否逾期：0-否 1-是',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_plan_start_time (plan_start_time),
    INDEX idx_is_overdue (is_overdue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 7. 工单工序进度表
DROP TABLE IF EXISTS work_order_process;
CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) COMMENT '工序编码',
    process_name VARCHAR(100) COMMENT '工序名称',
    sort_order INT COMMENT '工序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待处理 2-处理中 3-已完成 4-已跳过',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    duration BIGINT COMMENT '耗时(分钟)',
    output_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '产出数量',
    defective_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '不良品数量',
    equipment VARCHAR(100) COMMENT '使用设备',
    energy_consumption DECIMAL(10,2) DEFAULT 0 COMMENT '能耗',
    labor_hours DECIMAL(10,2) DEFAULT 0 COMMENT '人工工时',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_code (process_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序进度表';

-- 8. 工单用料明细表
DROP TABLE IF EXISTS work_order_material;
CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_id BIGINT COMMENT '工序ID',
    material_id BIGINT COMMENT '材料ID',
    material_name VARCHAR(100) COMMENT '材料名称',
    material_code VARCHAR(50) COMMENT '材料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    plan_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '计划用量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    waste_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_batch_no (batch_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

-- 9. 生产统计表
DROP TABLE IF EXISTS production_statistics;
CREATE TABLE production_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    statistics_date DATE COMMENT '统计日期',
    statistics_type TINYINT COMMENT '统计类型：1-日报 2-月报',
    work_order_count INT DEFAULT 0 COMMENT '工单数量',
    completed_order_count INT DEFAULT 0 COMMENT '完成工单数量',
    total_output_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总产量',
    total_defective_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总不良品数量',
    total_input_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总投入数量',
    total_waste_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总损耗数量',
    defective_rate DECIMAL(5,2) DEFAULT 0 COMMENT '不良品率(%)',
    yield_rate DECIMAL(5,2) DEFAULT 0 COMMENT '良品率(%)',
    material_utilization_rate DECIMAL(5,2) DEFAULT 0 COMMENT '物料利用率(%)',
    total_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    total_energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    total_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    total_packaging_cost DECIMAL(12,2) DEFAULT 0 COMMENT '包装成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位成本',
    unit_material_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位原料成本',
    unit_energy_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位能耗成本',
    unit_labor_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位人工成本',
    unit_packaging_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位包装成本',
    material_waste_cost DECIMAL(12,2) DEFAULT 0 COMMENT '物料损耗成本',
    process_waste_cost DECIMAL(12,2) DEFAULT 0 COMMENT '工序损耗成本',
    total_waste_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总损耗成本',
    total_labor_hours DECIMAL(10,2) DEFAULT 0 COMMENT '总工时',
    total_energy_consumption DECIMAL(10,2) DEFAULT 0 COMMENT '总能耗',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_statistics_date (statistics_date),
    INDEX idx_statistics_type (statistics_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产统计表';

-- 初始化数据
-- 插入默认管理员用户 (密码: 123456)
INSERT INTO sys_user (username, password, real_name, phone, role, status, create_time, update_time, create_by, update_by)
VALUES ('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 5, 1, NOW(), NOW(), 1, 1);

-- 插入测试用户
INSERT INTO sys_user (username, password, real_name, phone, role, status, create_time, update_time, create_by, update_by) VALUES
('purchaser', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', '13800138001', 1, 1, NOW(), NOW(), 1, 1),
('engineer', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', '13800138002', 2, 1, NOW(), NOW(), 1, 1),
('leader', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王五', '13800138003', 3, 1, NOW(), NOW(), 1, 1),
('qc', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵六', '13800138004', 4, 1, NOW(), NOW(), 1, 1);

-- 插入零食品类测试数据
INSERT INTO snack_category (name, code, parent_id, level, sort_order, priority, status, description, create_time, update_time, create_by, update_by) VALUES
('坚果类', 'NUT', 0, 1, 1, 1, 1, '坚果类零食', NOW(), NOW(), 1, 1),
('肉脯类', 'MEAT', 0, 1, 2, 2, 1, '肉脯类零食', NOW(), NOW(), 1, 1),
('果干类', 'FRUIT', 0, 1, 3, 3, 1, '果干类零食', NOW(), NOW(), 1, 1),
('膨化零食', 'PUFF', 0, 1, 4, 4, 1, '膨化类零食', NOW(), NOW(), 1, 1),
('夏威夷果', 'NUT_001', 1, 2, 1, 1, 1, '夏威夷果', NOW(), NOW(), 1, 1),
('巴旦木', 'NUT_002', 1, 2, 2, 2, 1, '巴旦木', NOW(), NOW(), 1, 1),
('猪肉脯', 'MEAT_001', 2, 2, 1, 1, 1, '猪肉脯', NOW(), NOW(), 1, 1),
('牛肉干', 'MEAT_002', 2, 2, 2, 2, 1, '牛肉干', NOW(), NOW(), 1, 1),
('芒果干', 'FRUIT_001', 3, 2, 1, 1, 1, '芒果干', NOW(), NOW(), 1, 1),
('草莓干', 'FRUIT_002', 3, 2, 2, 2, 1, '草莓干', NOW(), NOW(), 1, 1),
('薯片', 'PUFF_001', 4, 2, 1, 1, 1, '薯片', NOW(), NOW(), 1, 1),
('虾条', 'PUFF_002', 4, 2, 2, 2, 1, '虾条', NOW(), NOW(), 1, 1);

-- 插入原辅材料测试数据
INSERT INTO material (name, code, category_id, category_name, unit, spec, warning_stock, max_stock, is_fresh, shelf_life_days, supplier, status, description, create_time, update_time, create_by, update_by) VALUES
('夏威夷果原料', 'MAT_001', 1, '坚果类', 'kg', '一级', 100, 1000, 0, 180, '云南坚果供应商', 1, '精选夏威夷果', NOW(), NOW(), 1, 1),
('新鲜猪肉', 'MAT_002', 2, '肉脯类', 'kg', '冷鲜肉', 50, 500, 1, 7, '本地屠宰场', 1, '新鲜冷鲜猪肉', NOW(), NOW(), 1, 1),
('芒果', 'MAT_003', 3, '果干类', 'kg', '台农芒', 200, 2000, 1, 10, '海南芒果基地', 1, '新鲜芒果', NOW(), NOW(), 1, 1),
('马铃薯粉', 'MAT_004', 4, '膨化零食', 'kg', '食品级', 300, 3000, 0, 365, '淀粉厂', 1, '优质马铃薯粉', NOW(), NOW(), 1, 1),
('食用盐', 'MAT_005', NULL, '调味配料', 'kg', '精制盐', 500, 5000, 0, 730, '盐业公司', 1, '食用精制盐', NOW(), NOW(), 1, 1),
('白砂糖', 'MAT_006', NULL, '调味配料', 'kg', '一级', 500, 5000, 0, 365, '糖业公司', 1, '优质白砂糖', NOW(), NOW(), 1, 1),
('食品包装袋', 'MAT_007', NULL, '包装材料', '个', '100g装', 10000, 100000, 0, 365, '包装厂', 1, '食品级复合包装袋', NOW(), NOW(), 1, 1),
('辣椒面', 'MAT_008', NULL, '调味配料', 'kg', '一级', 100, 1000, 0, 180, '调味品厂', 1, '香辣辣椒面', NOW(), NOW(), 1, 1);

-- 10. 供应商表
DROP TABLE IF EXISTS supplier;
CREATE TABLE supplier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '供应商编码',
    name VARCHAR(100) NOT NULL COMMENT '供应商名称',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    business_scope VARCHAR(500) COMMENT '经营范围',
    qualification VARCHAR(500) COMMENT '资质文件',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-正常',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商表';

-- 11. 库存盘点表
DROP TABLE IF EXISTS stock_check;
CREATE TABLE stock_check (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    check_no VARCHAR(50) UNIQUE NOT NULL COMMENT '盘点单号',
    warehouse VARCHAR(50) COMMENT '仓库',
    check_date DATE COMMENT '盘点日期',
    check_type TINYINT COMMENT '盘点类型：1-全盘 2-抽盘',
    status TINYINT DEFAULT 1 COMMENT '状态：1-进行中 2-已完成',
    total_count INT DEFAULT 0 COMMENT '盘点总数量',
    difference_count INT DEFAULT 0 COMMENT '差异数量',
    total_difference_amount DECIMAL(12,2) DEFAULT 0 COMMENT '差异总金额',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_check_no (check_no),
    INDEX idx_check_date (check_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存盘点表';

-- 12. 库存盘点明细表
DROP TABLE IF EXISTS stock_check_detail;
CREATE TABLE stock_check_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    check_id BIGINT NOT NULL COMMENT '盘点单ID',
    material_id BIGINT COMMENT '材料ID',
    material_name VARCHAR(100) COMMENT '材料名称',
    material_code VARCHAR(50) COMMENT '材料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    system_quantity DECIMAL(10,2) COMMENT '系统数量',
    actual_quantity DECIMAL(10,2) COMMENT '实际数量',
    difference_quantity DECIMAL(10,2) COMMENT '差异数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    difference_amount DECIMAL(12,2) COMMENT '差异金额',
    reason VARCHAR(500) COMMENT '差异原因',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_check_id (check_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存盘点明细表';

-- 13. 设备表
DROP TABLE IF EXISTS equipment;
CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '设备编码',
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    model VARCHAR(100) COMMENT '型号',
    specification VARCHAR(100) COMMENT '规格',
    manufacturer VARCHAR(100) COMMENT '生产厂家',
    purchase_date DATE COMMENT '购置日期',
    workshop VARCHAR(50) COMMENT '所属车间',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用 1-正常 2-维修中',
    last_maintenance_date DATE COMMENT '上次维护日期',
    next_maintenance_date DATE COMMENT '下次维护日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_workshop (workshop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

-- 14. 质检记录表
DROP TABLE IF EXISTS quality_inspection;
CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    inspection_no VARCHAR(50) UNIQUE NOT NULL COMMENT '质检单号',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    process_code VARCHAR(50) COMMENT '工序编码',
    process_name VARCHAR(100) COMMENT '工序名称',
    inspection_type TINYINT COMMENT '质检类型：1-来料检验 2-过程检验 3-成品检验',
    inspection_result TINYINT COMMENT '质检结果：1-合格 2-不合格 3-让步接收',
    sample_quantity DECIMAL(10,2) COMMENT '抽检数量',
    qualified_quantity DECIMAL(10,2) COMMENT '合格数量',
    unqualified_quantity DECIMAL(10,2) COMMENT '不合格数量',
    unqualified_reason VARCHAR(500) COMMENT '不合格原因',
    inspector_id BIGINT COMMENT '检验员ID',
    inspector_name VARCHAR(50) COMMENT '检验员姓名',
    inspection_time DATETIME COMMENT '检验时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_inspection_no (inspection_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_inspection_result (inspection_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检记录表';

-- 15. 成品库存表
DROP TABLE IF EXISTS finished_goods_stock;
CREATE TABLE finished_goods_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    snack_category_id BIGINT COMMENT '零食品类ID',
    snack_category_name VARCHAR(100) COMMENT '零食品类名称',
    product_name VARCHAR(100) COMMENT '产品名称',
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '批次号',
    total_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '总数量',
    available_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '可用数量',
    locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '锁定数量',
    out_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已出库数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    production_date DATE COMMENT '生产日期',
    expire_date DATE COMMENT '到期日期',
    warehouse VARCHAR(50) COMMENT '仓库',
    location VARCHAR(50) COMMENT '库位',
    stock_status TINYINT DEFAULT 1 COMMENT '库存状态：1-正常 2-临期 3-已过期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_snack_category_id (snack_category_id),
    INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品库存表';

-- 插入供应商测试数据
INSERT INTO supplier (code, name, contact_person, contact_phone, address, business_scope, status, create_time, update_time, create_by, update_by) VALUES
('SUP_001', '云南坚果供应商', '王经理', '13900139001', '云南省昆明市', '坚果种植、加工、销售', 1, NOW(), NOW(), 1, 1),
('SUP_002', '本地屠宰场', '李厂长', '13900139002', '本地市郊区', '生猪屠宰、鲜肉销售', 1, NOW(), NOW(), 1, 1),
('SUP_003', '海南芒果基地', '张场长', '13900139003', '海南省三亚市', '芒果种植、销售', 1, NOW(), NOW(), 1, 1),
('SUP_004', '淀粉厂', '刘总', '13900139004', '本地市工业园', '淀粉生产、销售', 1, NOW(), NOW(), 1, 1),
('SUP_005', '盐业公司', '陈经理', '13900139005', '本地市', '食用盐销售', 1, NOW(), NOW(), 1, 1),
('SUP_006', '糖业公司', '周经理', '13900139006', '广西南宁市', '白砂糖生产、销售', 1, NOW(), NOW(), 1, 1),
('SUP_007', '包装厂', '吴厂长', '13900139007', '本地市工业园', '食品包装生产', 1, NOW(), NOW(), 1, 1),
('SUP_008', '调味品厂', '郑经理', '13900139008', '四川省成都市', '调味品生产、销售', 1, NOW(), NOW(), 1, 1);

-- 插入设备测试数据
INSERT INTO equipment (code, name, model, specification, manufacturer, purchase_date, workshop, status, create_time, update_time, create_by, update_by) VALUES
('EQ_001', '气泡清洗机', 'QX-500', '500kg/h', '山东食品机械有限公司', '2024-01-15', '预处理车间', 1, NOW(), NOW(), 1, 1),
('EQ_002', '滚筒调味机', 'TW-300', '300kg/h', '上海食品机械有限公司', '2024-01-15', '调味车间', 1, NOW(), NOW(), 1, 1),
('EQ_003', '热风烘烤机', 'HK-600', '600kg/h', '广东烘焙设备厂', '2024-01-20', '烘烤车间', 1, NOW(), NOW(), 1, 1),
('EQ_004', '自动包装机', 'BZ-200', '200袋/min', '浙江包装机械有限公司', '2024-01-20', '包装车间', 1, NOW(), NOW(), 1, 1),
('EQ_005', '激光打码机', 'DM-1000', '1000件/h', '深圳激光设备厂', '2024-01-25', '包装车间', 1, NOW(), NOW(), 1, 1),
('EQ_006', '金属探测仪', 'TS-200', '200kg/h', '上海检测设备厂', '2024-01-25', '质检车间', 1, NOW(), NOW(), 1, 1),
('EQ_007', '杀菌机', 'SJ-400', '400kg/h', '江苏杀菌设备厂', '2024-02-01', '烘烤车间', 1, NOW(), NOW(), 1, 1),
('EQ_008', '分选机', 'FX-300', '300kg/h', '山东分选设备厂', '2024-02-01', '预处理车间', 1, NOW(), NOW(), 1, 1);
