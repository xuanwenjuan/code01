CREATE DATABASE IF NOT EXISTS valve_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE valve_manufacture;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    priority INT DEFAULT 0 COMMENT '排序优先级',
    status TINYINT DEFAULT 1 COMMENT '状态 0-下线 1-正常',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '原料类型',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    total_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '总库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停止采购 1-库存预警 2-库存充足',
    is_rust_prone TINYINT DEFAULT 0 COMMENT '是否易锈蚀 0-否 1-是',
    rust_remind_days INT DEFAULT 7 COMMENT '防锈提醒天数',
    last_rust_check DATE COMMENT '上次防锈检查日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_type (material_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    batch_no VARCHAR(100) NOT NULL UNIQUE COMMENT '批次编号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    supplier VARCHAR(100) COMMENT '供应商',
    inbound_date DATE COMMENT '入库日期',
    expiration_date DATE COMMENT '有效期至',
    warehouse_location VARCHAR(100) COMMENT '库位',
    status TINYINT DEFAULT 1 COMMENT '状态 0-已用完 1-在库',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_no (batch_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料批次表';

CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    product_category_id BIGINT NOT NULL COMMENT '产品分类ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    quantity INT NOT NULL COMMENT '生产数量',
    priority INT DEFAULT 0 COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 PENDING-待开始 CUTTING-下料中 TURNING-车削中 GRINDING-研磨中 TESTING-测试中 RUST_PROOF-防锈处理 FINISHED-已完成 PAUSED-已暂停 CANCELLED-已取消',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    assignee_id BIGINT COMMENT '负责人ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_status (status),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_plan_start_date (plan_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工序ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_order INT NOT NULL COMMENT '工序顺序',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 PENDING-待开始 PROCESSING-进行中 FINISHED-已完成',
    operator_id BIGINT COMMENT '操作人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    work_hours DECIMAL(4,2) COMMENT '工时',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    receiver_id BIGINT COMMENT '领用人ID',
    receive_time DATETIME COMMENT '领用时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成本ID',
    cost_no VARCHAR(50) NOT NULL UNIQUE COMMENT '成本编号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(12,2) DEFAULT 0 COMMENT '刀具损耗成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    status TINYINT DEFAULT 0 COMMENT '状态 0-待确认 1-已确认',
    confirm_time DATETIME COMMENT '确认时间',
    confirmer_id BIGINT COMMENT '确认人ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_cost_no (cost_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '质检ID',
    inspection_no VARCHAR(50) NOT NULL UNIQUE COMMENT '质检编号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_id BIGINT COMMENT '工序ID',
    inspector_id BIGINT COMMENT '质检员ID',
    inspection_type VARCHAR(20) COMMENT '质检类型',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    unqualified_quantity INT DEFAULT 0 COMMENT '不合格数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    inspection_result VARCHAR(20) COMMENT '质检结果 PASS-合格 FAIL-不合格 REWORK-返工',
    inspection_time DATETIME COMMENT '质检时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_inspection_result (inspection_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    operation_type VARCHAR(50) COMMENT '操作类型',
    module_name VARCHAR(50) COMMENT '模块名称',
    business_id BIGINT COMMENT '业务ID',
    business_no VARCHAR(100) COMMENT '业务编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_content TEXT COMMENT '操作内容',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_operator_id (operator_id),
    INDEX idx_business_id (business_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '13800138000', 'admin@valve.com', 'ADMIN', 1),
('purchase', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '采购员', '13800138001', 'purchase@valve.com', 'PURCHASE', 1),
('process', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '工艺员', '13800138002', 'process@valve.com', 'PROCESS', 1),
('production', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '生产员', '13800138003', 'production@valve.com', 'PRODUCTION', 1),
('quality', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '质检员', '13800138004', 'quality@valve.com', 'QUALITY', 1);

INSERT INTO product_category (parent_id, category_name, category_code, priority, status) VALUES
(0, '截止阀', 'GLOBE_VALVE', 1, 1),
(0, '球阀', 'BALL_VALVE', 2, 1),
(0, '蝶阀', 'BUTTERFLY_VALVE', 3, 1),
(0, '定制精密阀门', 'CUSTOM_VALVE', 4, 1),
(1, '法兰截止阀', 'FLANGE_GLOBE', 1, 1),
(1, '螺纹截止阀', 'THREAD_GLOBE', 2, 1),
(2, '浮动球阀', 'FLOATING_BALL', 1, 1),
(2, '固定球阀', 'FIXED_BALL', 2, 1),
(3, '对夹蝶阀', 'WAFER_BUTTERFLY', 1, 1),
(3, '法兰蝶阀', 'FLANGE_BUTTERFLY', 2, 1),
(4, '高压精密阀', 'HIGH_PRESSURE', 1, 1),
(4, '高温精密阀', 'HIGH_TEMP', 2, 1);

INSERT INTO material (material_code, material_name, material_type, specification, unit, total_quantity, warning_quantity, status, is_rust_prone, rust_remind_days) VALUES
('SS304-001', '304不锈钢棒料', 'METAL', 'φ50mm*1000mm', '根', 100, 20, 2, 1, 7),
('SS316-001', '316不锈钢棒料', 'METAL', 'φ60mm*1000mm', '根', 50, 15, 1, 1, 7),
('CU-001', '铜合金坯料', 'METAL', 'φ40mm*500mm', '块', 80, 10, 2, 0, 0),
('SEAL-001', '密封垫片', 'SEAL', 'DN50-PN16', '片', 500, 100, 2, 0, 0),
('SEAL-002', 'O型密封圈', 'SEAL', 'φ50mm', '个', 1000, 200, 2, 0, 0),
('CUT-001', '切削液', 'CHEMICAL', '20L/桶', '桶', 30, 5, 2, 0, 0),
('CUT-002', '防锈油', 'CHEMICAL', '10L/桶', '桶', 20, 3, 1, 0, 0);
