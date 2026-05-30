-- 创建数据库
CREATE DATABASE IF NOT EXISTS piston_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE piston_manufacture;

-- 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role_id INT COMMENT '角色ID',
    status INT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 系统角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(200) COMMENT '角色描述',
    status INT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 活塞产品分类表
CREATE TABLE IF NOT EXISTS piston_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '排产优先级',
    status INT DEFAULT 1 COMMENT '状态 0-下线 1-启用',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活塞产品分类表';

-- 棒料原料库存表
CREATE TABLE IF NOT EXISTS material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(100) UNIQUE COMMENT '批次号',
    material_type VARCHAR(50) COMMENT '原料类型',
    material_name VARCHAR(100) COMMENT '原料名称',
    specification VARCHAR(200) COMMENT '规格型号',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) DEFAULT '根' COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    stock_status INT DEFAULT 1 COMMENT '库存状态 1-充足 2-预警 3-不足',
    supplier VARCHAR(200) COMMENT '供应商',
    inbound_date DATE COMMENT '入库日期',
    expiry_date DATE COMMENT '有效期至',
    warehouse_location VARCHAR(100) COMMENT '存放位置',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='棒料原料库存表';

-- 生产工单表
CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(100) UNIQUE COMMENT '工单号',
    category_id BIGINT COMMENT '分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    piston_model VARCHAR(100) COMMENT '活塞型号',
    quantity INT COMMENT '生产数量',
    material_id BIGINT COMMENT '原料ID',
    material_batch VARCHAR(100) COMMENT '原料批次',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_used DECIMAL(10,2) COMMENT '原料使用量',
    current_process INT DEFAULT 1 COMMENT '当前工序 1-切断下料 2-粗车外圆 3-精车端面沟槽 4-滚压内孔 5-高频淬火 6-外径研磨 7-质检',
    status INT DEFAULT 0 COMMENT '工单状态 0-待开始 1-进行中 2-暂停 3-已完成 4-已取消',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划完成时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    process_user_id BIGINT COMMENT '加工人ID',
    process_user_name VARCHAR(50) COMMENT '加工人姓名',
    quality_user_id BIGINT COMMENT '质检人ID',
    quality_user_name VARCHAR(50) COMMENT '质检人姓名',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_piston_model (piston_model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 生产成本表
CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(100) COMMENT '工单号',
    piston_model VARCHAR(100) COMMENT '活塞型号',
    quantity INT COMMENT '数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(12,2) DEFAULT 0 COMMENT '刀具损耗成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废损失成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    report_year INT COMMENT '统计年份',
    report_month INT COMMENT '统计月份',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是',
    INDEX idx_order_id (order_id),
    INDEX idx_year_month (report_year, report_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    real_name VARCHAR(50) COMMENT '真实姓名',
    module VARCHAR(100) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(500) COMMENT '方法名',
    params TEXT COMMENT '参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    status INT DEFAULT 1 COMMENT '状态 0-失败 1-成功',
    error_msg TEXT COMMENT '错误信息',
    execution_time BIGINT COMMENT '执行时间(毫秒)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '是否删除 0-否 1-是',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化角色数据
INSERT INTO sys_role (id, role_name, role_code, description, status) VALUES
(1, '超级管理员', 'ADMIN', '系统超级管理员', 1),
(2, '原料采购员', 'MATERIAL_PURCHASER', '负责原料采购和入库', 1),
(3, '机加工工艺员', 'MACHINING_TECHNICIAN', '负责工艺制定和工单创建', 1),
(4, '数控班组组长', 'CNC_TEAM_LEADER', '负责生产加工和工序流转', 1),
(5, '尺寸质检专员', 'QUALITY_INSPECTOR', '负责产品质量检验', 1);

-- 初始化管理员用户 (密码: admin123, MD5加密后)
INSERT INTO sys_user (id, username, password, real_name, phone, email, role_id, status) VALUES
(1, 'admin', '0192023a7bbd73250516f069df18b500', '系统管理员', '13800138000', 'admin@example.com', 1, 1);

-- 初始化活塞分类数据
INSERT INTO piston_category (id, category_name, category_code, parent_id, level, sort, priority, status, description) VALUES
(1, '工程机械活塞', 'ENGINEERING', 0, 1, 1, 1, 1, '工程机械用液压活塞'),
(2, '液压系统活塞', 'HYDRAULIC', 0, 1, 2, 2, 1, '通用液压系统活塞'),
(3, '叉车重载活塞', 'FORKLIFT', 0, 1, 3, 1, 1, '叉车重载液压活塞'),
(4, '小型油缸定制活塞', 'CUSTOM', 0, 1, 4, 3, 1, '小型油缸定制化活塞'),
(5, '挖掘机活塞', 'EXCAVATOR', 1, 2, 1, 1, 1, '挖掘机液压活塞'),
(6, '装载机活塞', 'LOADER', 1, 2, 2, 2, 1, '装载机液压活塞');
