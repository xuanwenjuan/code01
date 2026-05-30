CREATE DATABASE IF NOT EXISTS material_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE material_management;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) NOT NULL COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    avatar VARCHAR(255) COMMENT '头像',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

DROP TABLE IF EXISTS material_category;
CREATE TABLE material_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    ancestors VARCHAR(500) COMMENT '祖级列表',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    unit VARCHAR(20) COMMENT '单位',
    specification VARCHAR(200) COMMENT '规格说明',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='建材分类表';

DROP TABLE IF EXISTS material_inventory;
CREATE TABLE material_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    material_code VARCHAR(50) COMMENT '材料编码',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(18,2) DEFAULT 0 COMMENT '数量',
    unit_price DECIMAL(18,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总金额',
    batch_no VARCHAR(50) COMMENT '批次号',
    supplier VARCHAR(100) COMMENT '供应商',
    warehouse VARCHAR(50) COMMENT '仓库',
    location VARCHAR(100) COMMENT '存放位置',
    production_date DATETIME COMMENT '生产日期',
    expiry_date DATETIME COMMENT '有效期至',
    moisture_proof_days INT DEFAULT 0 COMMENT '防潮天数',
    inventory_status TINYINT DEFAULT 1 COMMENT '库存状态：1-正常，2-预警，3-缺货，4-过期，5-防潮预警',
    warning_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '预警数量',
    max_quantity DECIMAL(18,2) COMMENT '最大库存',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_category_id (category_id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_inventory_status (inventory_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='建材库存表';

DROP TABLE IF EXISTS material_work_order;
CREATE TABLE material_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    order_type TINYINT NOT NULL COMMENT '工单类型：1-采购入库，2-班组领用，3-余料退回，4-损耗登记',
    order_type_name VARCHAR(50) COMMENT '工单类型名称',
    project_name VARCHAR(100) NOT NULL COMMENT '项目名称',
    construction_team VARCHAR(100) COMMENT '施工班组',
    team_leader VARCHAR(50) COMMENT '班组长',
    team_leader_phone VARCHAR(20) COMMENT '班组长电话',
    plan_use_date DATETIME COMMENT '计划使用日期',
    actual_use_date DATETIME COMMENT '实际使用日期',
    return_date DATETIME COMMENT '退回日期',
    status TINYINT DEFAULT 1 COMMENT '状态：0-已取消，1-待审核，2-已审核，3-已出库，4-已核销，-1-已驳回，-2-已过期',
    status_name VARCHAR(50) COMMENT '状态名称',
    total_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '总数量',
    total_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总金额',
    used_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '已使用数量',
    returned_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '已退回数量',
    lost_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '损耗数量',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(500) COMMENT '审核备注',
    warehouse_keeper VARCHAR(50) COMMENT '仓管员',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_project_name (project_name),
    INDEX idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='建材领用工单表';

DROP TABLE IF EXISTS work_order_detail;
CREATE TABLE work_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    inventory_id BIGINT NOT NULL COMMENT '库存ID',
    category_id BIGINT COMMENT '分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    material_name VARCHAR(100) COMMENT '材料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    plan_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '计划数量',
    actual_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '实际数量',
    unit_price DECIMAL(18,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总金额',
    used_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '已使用数量',
    returned_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '已退回数量',
    lost_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '损耗数量',
    batch_no VARCHAR(50) COMMENT '批次号',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_inventory_id (inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单明细表';

DROP TABLE IF EXISTS cost_statistics;
CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    statistics_no VARCHAR(50) NOT NULL UNIQUE COMMENT '统计编号',
    project_name VARCHAR(100) COMMENT '项目名称',
    statistics_date DATETIME COMMENT '统计日期',
    main_material_cost DECIMAL(18,2) DEFAULT 0 COMMENT '主材采购费用',
    auxiliary_material_cost DECIMAL(18,2) DEFAULT 0 COMMENT '辅材消耗成本',
    transportation_cost DECIMAL(18,2) DEFAULT 0 COMMENT '短途运输费用',
    labor_cost DECIMAL(18,2) DEFAULT 0 COMMENT '现场人工搬运成本',
    waste_cost DECIMAL(18,2) DEFAULT 0 COMMENT '施工浪费损耗成本',
    total_cost DECIMAL(18,2) DEFAULT 0 COMMENT '总成本',
    statistics_type TINYINT DEFAULT 1 COMMENT '统计类型：1-周，2-月，3-季，4-年',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_statistics_no (statistics_no),
    INDEX idx_project_name (project_name),
    INDEX idx_statistics_date (statistics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作',
    description VARCHAR(200) COMMENT '描述',
    method VARCHAR(200) COMMENT '方法',
    request_uri VARCHAR(200) COMMENT '请求URI',
    request_method VARCHAR(10) COMMENT '请求方法',
    ip VARCHAR(50) COMMENT 'IP地址',
    params TEXT COMMENT '请求参数',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-成功，0-失败',
    error_msg TEXT COMMENT '错误信息',
    operate_by BIGINT COMMENT '操作人',
    operate_time DATETIME COMMENT '操作时间',
    INDEX idx_module (module),
    INDEX idx_operate_by (operate_by),
    INDEX idx_operate_time (operate_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, role, role_name, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'ADMIN', '系统管理员', 1),
('purchaser', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', 'PURCHASER', '采购专员', 1),
('warehouse', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', 'WAREHOUSE_KEEPER', '工地仓管', 1),
('supervisor', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王五', 'SUPERVISOR', '工程监理', 1),
('finance', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵六', 'FINANCE', '财务核算', 1);

INSERT INTO material_category (category_name, category_code, parent_id, ancestors, level, sort_order, unit, priority, status) VALUES
('钢筋钢材类', 'STEEL', 0, '0', 1, 1, '吨', 100, 1),
('水泥砂石类', 'CEMENT', 0, '0', 1, 2, '吨', 90, 1),
('水电管材类', 'PIPE', 0, '0', 1, 3, '米', 80, 1),
('装饰辅材类', 'DECORATION', 0, '0', 1, 4, '箱', 70, 1),
('螺纹钢', 'REBAR', 1, '0,1', 2, 1, '吨', 100, 1),
('圆钢', 'ROUND_STEEL', 1, '0,1', 2, 2, '吨', 90, 1),
('工字钢', 'I_STEEL', 1, '0,1', 2, 3, '吨', 80, 1),
('硅酸盐水泥', 'PORTLAND_CEMENT', 2, '0,2', 2, 1, '吨', 100, 1),
('河沙', 'RIVER_SAND', 2, '0,2', 2, 2, '立方米', 90, 1),
('碎石', 'GRAVEL', 2, '0,2', 2, 3, '立方米', 80, 1),
('PVC管材', 'PVC_PIPE', 3, '0,3', 2, 1, '米', 100, 1),
('PPR管材', 'PPR_PIPE', 3, '0,3', 2, 2, '米', 90, 1),
('电线电缆', 'CABLE', 3, '0,3', 2, 3, '米', 80, 1),
('防水材料', 'WATERPROOF', 4, '0,4', 2, 1, '平方米', 100, 1),
('保温材料', 'INSULATION', 4, '0,4', 2, 2, '平方米', 90, 1),
('涂料油漆', 'PAINT', 4, '0,4', 2, 3, '桶', 80, 1);
