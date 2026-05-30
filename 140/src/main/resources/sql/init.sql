CREATE DATABASE IF NOT EXISTS gearbox_manage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gearbox_manage;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) NOT NULL COMMENT '角色：ADMIN-管理员, PURCHASER-采购专员, PROCESS_ENGINEER-机加工工艺员, TEAM_LEADER-产线组长, QUALITY_INSPECTOR-精度质检员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE gearbox_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    category_type VARCHAR(50) NOT NULL COMMENT '分类类型：PLANETARY-行星齿轮箱, CYLINDRICAL-圆柱齿轮箱, BEVEL-斜齿轮箱, CUSTOM-定制精密壳体',
    description VARCHAR(500) COMMENT '分类描述',
    priority INT DEFAULT 0 COMMENT '排产优先级：数字越大优先级越高',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下线停产，1-正常生产',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='齿轮箱壳体分类表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型：CAST_IRON-铸铁毛坯, CAST_STEEL-铸钢坯料, ALUMINUM-铝合金壳体坯, AUXILIARY-加工切削辅料',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '计量单位',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 10 COMMENT '预警数量',
    status VARCHAR(20) DEFAULT 'SUFFICIENT' COMMENT '库存状态：SUFFICIENT-库存充足, WARNING-库存预警, STOP-停止采购',
    is_easy_oxidize TINYINT DEFAULT 0 COMMENT '是否易氧化：0-否，1-是',
    rustproof_days INT DEFAULT 30 COMMENT '防锈有效期(天)',
    supplier VARCHAR(100) COMMENT '供应商',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_type (material_type),
    INDEX idx_status (status),
    INDEX idx_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='壳体原料仓储表';

CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '批次数量',
    used_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已使用数量',
    inbound_date DATE COMMENT '入库日期',
    expiration_date DATE COMMENT '过期日期',
    warehouse_location VARCHAR(100) COMMENT '库位',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '批次状态：NORMAL-正常, EXPIRING-即将过期, EXPIRED-已过期, USED_UP-已用完',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_code (batch_code),
    INDEX idx_expiration_date (expiration_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料批次表';

CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '壳体分类ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    quantity INT NOT NULL COMMENT '生产数量',
    priority INT DEFAULT 0 COMMENT '工单优先级',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待投产, PREPARING-备料中, READY-已备料, ROUGH_MILLING-粗铣成型, FINE_MILLING-精铣端面, BORING-孔系镗削, THREADING-螺纹加工, GRINDING-圆角打磨, INSPECTION-精度检测, RUSTPROOF-防锈处理, FINISHED-成品入库, PAUSED-已暂停, CANCELLED-已取消',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    total_hours DECIMAL(10,2) DEFAULT 0 COMMENT '总工时',
    team_leader_id BIGINT COMMENT '产线组长ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_category_id (category_id),
    INDEX idx_plan_start_date (plan_start_date),
    INDEX idx_team_leader_id (team_leader_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_id BIGINT COMMENT '批次ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    required_quantity DECIMAL(10,2) NOT NULL COMMENT '需求数量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际领用数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(12,2) DEFAULT 0 COMMENT '总价',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待领料, PICKED-已领料, RETURNED-已退料',
    pick_time DATETIME COMMENT '领料时间',
    pick_user_id BIGINT COMMENT '领料人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料明细表';

CREATE TABLE work_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工序ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_order INT NOT NULL COMMENT '工序顺序',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    work_hours DECIMAL(10,2) DEFAULT 0 COMMENT '工时',
    machine_code VARCHAR(50) COMMENT '机床编号',
    machine_hours DECIMAL(10,2) DEFAULT 0 COMMENT '机台工时',
    tool_usage DECIMAL(10,2) DEFAULT 0 COMMENT '刀具损耗',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待开始, PROCESSING-进行中, COMPLETED-已完成, PAUSED-已暂停',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_order (process_order),
    INDEX idx_operator_id (operator_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工序记录表';

CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '检验ID',
    inspection_no VARCHAR(50) NOT NULL UNIQUE COMMENT '检验单号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_id BIGINT COMMENT '工序ID',
    inspector_id BIGINT COMMENT '检验人ID',
    inspector_name VARCHAR(50) COMMENT '检验人姓名',
    inspect_time DATETIME COMMENT '检验时间',
    inspect_quantity INT DEFAULT 0 COMMENT '检验数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    rework_quantity INT DEFAULT 0 COMMENT '返工数量',
    scrap_reason VARCHAR(500) COMMENT '报废原因',
    inspection_items TEXT COMMENT '检验项明细(JSON)',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待检验, PASSED-合格, FAILED-不合格, REWORK-需返工',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_inspection_no (inspection_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_id (process_id),
    INDEX idx_inspector_id (inspector_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验表';

CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '核算ID',
    work_order_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(12,2) DEFAULT 0 COMMENT '刀具损耗成本',
    machine_cost DECIMAL(12,2) DEFAULT 0 COMMENT '机床能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废成本',
    other_cost DECIMAL(12,2) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    quantity INT COMMENT '生产数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    accounting_date DATE COMMENT '核算日期',
    accountant_id BIGINT COMMENT '核算人ID',
    accountant_name VARCHAR(50) COMMENT '核算人姓名',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿, CONFIRMED-已确认',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_accounting_date (accounting_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加工成本核算表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation VARCHAR(100) COMMENT '操作类型',
    module VARCHAR(50) COMMENT '操作模块',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    ip VARCHAR(50) COMMENT 'IP地址',
    duration BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败，1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time),
    INDEX idx_module (module),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000', 'ADMIN', 1),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张采购', '13800138001', 'PURCHASER', 1),
('engineer01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李工艺', '13800138002', 'PROCESS_ENGINEER', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王组长', '13800138003', 'TEAM_LEADER', 1),
('inspector01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵质检', '13800138004', 'QUALITY_INSPECTOR', 1);

INSERT INTO gearbox_category (parent_id, category_name, category_code, category_type, description, priority, status) VALUES
(0, '行星齿轮箱壳体', 'PLANETARY', 'PLANETARY', '行星齿轮箱壳体大类', 100, 1),
(1, '标准行星壳体', 'PLANETARY-STD', 'PLANETARY', '标准系列行星齿轮箱壳体', 90, 1),
(1, '重载行星壳体', 'PLANETARY-HVY', 'PLANETARY', '重载系列行星齿轮箱壳体', 95, 1),
(0, '圆柱齿轮箱壳体', 'CYLINDRICAL', 'CYLINDRICAL', '圆柱齿轮箱壳体大类', 80, 1),
(4, '平行轴圆柱壳体', 'CYLINDRICAL-PAR', 'CYLINDRICAL', '平行轴圆柱齿轮箱壳体', 75, 1),
(0, '斜齿轮箱壳体', 'BEVEL', 'BEVEL', '斜齿轮箱壳体大类', 85, 1),
(0, '定制精密壳体', 'CUSTOM', 'CUSTOM', '客户定制精密壳体', 110, 1);
