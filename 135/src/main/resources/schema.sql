CREATE DATABASE IF NOT EXISTS impeller_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE impeller_production;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) COMMENT '角色',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态 0下线 1上线',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(100) NOT NULL UNIQUE COMMENT '批次号',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type VARCHAR(50) COMMENT '原料类型',
    material_code VARCHAR(50) COMMENT '原料编码',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    stock_status INT DEFAULT 1 COMMENT '库存状态 1充足 2预警 3停止采购',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期',
    shelf_life_days INT COMMENT '保质期天数',
    supplier VARCHAR(200) COMMENT '供应商',
    warehouse VARCHAR(100) COMMENT '仓库',
    remark VARCHAR(500) COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(100) NOT NULL UNIQUE COMMENT '工单号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    quantity DECIMAL(10,2) COMMENT '数量',
    status INT DEFAULT 1 COMMENT '状态 1待生产 2生产中 3已暂停 4已完成',
    current_step INT DEFAULT 0 COMMENT '当前工序 1熔炼 2压铸 3冷却 4切边 5动平衡 6表面处理 7入库',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    melting_records TEXT COMMENT '熔炼记录',
    casting_records TEXT COMMENT '压铸记录',
    cooling_records TEXT COMMENT '冷却记录',
    trimming_records TEXT COMMENT '切边记录',
    balancing_records TEXT COMMENT '动平衡记录',
    surface_treatment_records TEXT COMMENT '表面处理记录',
    storage_records TEXT COMMENT '入库记录',
    operator_id BIGINT COMMENT '操作员ID',
    operator_name VARCHAR(50) COMMENT '操作员姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

CREATE TABLE IF NOT EXISTS work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料表';

CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    material_cost DECIMAL(12,2) COMMENT '原料成本',
    mold_cost DECIMAL(12,2) COMMENT '模具成本',
    energy_cost DECIMAL(12,2) COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) COMMENT '人工成本',
    scrap_cost DECIMAL(12,2) COMMENT '报废成本',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    unit_cost DECIMAL(10,2) COMMENT '单位成本',
    quantity DECIMAL(10,2) COMMENT '数量',
    report_date VARCHAR(20) COMMENT '报表日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(100) COMMENT '操作',
    module VARCHAR(100) COMMENT '模块',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '参数',
    result TEXT COMMENT '结果',
    duration BIGINT COMMENT '耗时',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除',
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Hl8xmQ47mNvKxvKxvKxvK', '管理员', 'admin', 1),
('purchase', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Hl8xmQ47mNvKxvKxvKxvK', '采购专员', 'purchase', 1),
('process', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Hl8xmQ47mNvKxvKxvKxvK', '工艺工程师', 'process', 1),
('production', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Hl8xmQ47mNvKxvKxvKxvK', '生产主管', 'production', 1),
('quality', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Hl8xmQ47mNvKxvKxvKxvK', '质检员', 'quality', 1);

INSERT INTO product_category (category_name, category_code, parent_id, level, sort, priority, status) VALUES
('离心风机叶轮', 'CENTRIFUGAL', 0, 1, 1, 100, 1),
('轴流风机叶轮', 'AXIAL', 0, 1, 2, 90, 1),
('防腐合金叶轮', 'ANTICORROSIVE', 0, 1, 3, 80, 1),
('工业散热叶轮', 'COOLING', 0, 1, 4, 70, 1),
('铝合金离心叶轮', 'AL-CENTRIFUGAL', 1, 2, 1, 100, 1),
('不锈钢离心叶轮', 'SS-CENTRIFUGAL', 1, 2, 2, 95, 1),
('铸铝轴流叶轮', 'AL-AXIAL', 2, 2, 1, 90, 1),
('塑料轴流叶轮', 'PLASTIC-AXIAL', 2, 2, 2, 85, 1),
('钛合金防腐叶轮', 'TI-ANTICORROSIVE', 3, 2, 1, 80, 1),
('镀镍防腐叶轮', 'NI-ANTICORROSIVE', 3, 2, 2, 75, 1),
('铝制散热叶轮', 'AL-COOLING', 4, 2, 1, 70, 1),
('铜制散热叶轮', 'CU-COOLING', 4, 2, 2, 65, 1);

INSERT INTO material (batch_no, material_name, material_type, material_code, quantity, unit, unit_price, total_amount, stock_status, production_date, shelf_life_days, supplier, warehouse, status) VALUES
('AL-20240101-ABCD', '铝合金锭', '铝合金', 'AL-001', 5000.00, 'kg', 18.50, 92500.00, 1, '2024-01-01', 365, '铝业供应商A', '原料仓库1', 1),
('ZINC-20240101-ABCD', '锌合金原料', '锌合金', 'ZINC-001', 2000.00, 'kg', 22.00, 44000.00, 1, '2024-01-01', 365, '锌业供应商B', '原料仓库1', 1),
('REF-20240101-ABCD', '精炼助剂', '助剂', 'REF-001', 500.00, 'kg', 85.00, 42500.00, 2, '2024-01-01', 180, '助剂供应商C', '原料仓库2', 1),
('RELEASE-20240101-ABCD', '脱模剂', '辅料', 'RELEASE-001', 80.00, 'kg', 45.00, 3600.00, 3, '2024-01-01', 90, '辅料供应商D', '原料仓库2', 1);

CREATE TABLE IF NOT EXISTS material_stock_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    type INT COMMENT '类型 1入库 2出库',
    before_quantity DECIMAL(10,2) COMMENT '变更前数量',
    change_quantity DECIMAL(10,2) COMMENT '变更数量',
    after_quantity DECIMAL(10,2) COMMENT '变更后数量',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    purchase_order_id BIGINT COMMENT '采购订单ID',
    purchase_order_no VARCHAR(100) COMMENT '采购单号',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存流水表';

CREATE TABLE IF NOT EXISTS material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    lock_quantity DECIMAL(10,2) COMMENT '锁定数量',
    lock_type VARCHAR(50) COMMENT '锁定类型',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    lock_time DATETIME COMMENT '锁定时间',
    expire_time DATETIME COMMENT '过期时间',
    status INT DEFAULT 1 COMMENT '状态 1有效 0失效',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料锁定表';

CREATE TABLE IF NOT EXISTS purchase_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(100) NOT NULL UNIQUE COMMENT '采购单号',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_type VARCHAR(50) COMMENT '原料类型',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    supplier VARCHAR(200) COMMENT '供应商',
    status INT DEFAULT 1 COMMENT '状态 1待审核 2已通过 3已入库 4已拒绝',
    applicant_id BIGINT COMMENT '申请人ID',
    applicant_name VARCHAR(50) COMMENT '申请人姓名',
    auditor_id BIGINT COMMENT '审核人ID',
    auditor_name VARCHAR(50) COMMENT '审核人姓名',
    audit_time DATETIME COMMENT '审核时间',
    expect_time DATE COMMENT '期望到货时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购订单表';

CREATE TABLE IF NOT EXISTS work_order_exception (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    step INT COMMENT '工序',
    step_name VARCHAR(50) COMMENT '工序名称',
    exception_type VARCHAR(50) COMMENT '异常类型',
    description TEXT COMMENT '异常描述',
    reporter_id BIGINT COMMENT '上报人ID',
    reporter_name VARCHAR(50) COMMENT '上报人姓名',
    handler_id BIGINT COMMENT '处理人ID',
    handler_name VARCHAR(50) COMMENT '处理人姓名',
    handle_time DATETIME COMMENT '处理时间',
    handle_result TEXT COMMENT '处理结果',
    status INT DEFAULT 1 COMMENT '状态 1待处理 2处理中 3已完成',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单异常表';

CREATE TABLE IF NOT EXISTS quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(100) COMMENT '工单号',
    step INT COMMENT '工序',
    step_name VARCHAR(50) COMMENT '工序名称',
    total_quantity DECIMAL(10,2) COMMENT '总数量',
    qualified_quantity DECIMAL(10,2) COMMENT '合格数量',
    unqualified_quantity DECIMAL(10,2) COMMENT '不合格数量',
    unqualified_reason TEXT COMMENT '不合格原因',
    scrap_quantity DECIMAL(10,2) COMMENT '报废数量',
    rework_quantity DECIMAL(10,2) COMMENT '返工数量',
    inspector_id BIGINT COMMENT '质检员ID',
    inspector_name VARCHAR(50) COMMENT '质检员姓名',
    inspection_time DATETIME COMMENT '检验时间',
    result INT COMMENT '检验结果 1合格 2不合格 3返工',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验表';
