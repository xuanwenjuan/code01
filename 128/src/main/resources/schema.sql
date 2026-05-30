CREATE DATABASE IF NOT EXISTS bearing_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bearing_production;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role INT NOT NULL COMMENT '角色：1-原料采购员 2-锻造工艺员 3-产线组长 4-品质巡检员 5-管理员',
    status INT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(100) NOT NULL COMMENT '模块名称',
    description VARCHAR(500) COMMENT '操作描述',
    method VARCHAR(200) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    duration BIGINT COMMENT '耗时(毫秒)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    INDEX idx_module (module),
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

CREATE TABLE IF NOT EXISTS bearing_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '品类编码',
    category_name VARCHAR(100) NOT NULL COMMENT '品类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '生产优先级',
    status INT DEFAULT 1 COMMENT '状态：0-下线 1-启用',
    specification VARCHAR(500) COMMENT '规格说明',
    material VARCHAR(200) COMMENT '材质',
    remark VARCHAR(1000) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轴承套圈品类表';

CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_code VARCHAR(50) NOT NULL COMMENT '原料编码',
    batch_no VARCHAR(100) NOT NULL UNIQUE COMMENT '批次号',
    material_name VARCHAR(200) NOT NULL COMMENT '原料名称',
    specification VARCHAR(500) COMMENT '规格型号',
    material_type VARCHAR(100) COMMENT '原料类型',
    supplier VARCHAR(200) COMMENT '供应商',
    unit_price DECIMAL(10,2) COMMENT '单价',
    stock_quantity DECIMAL(10,2) COMMENT '库存数量',
    unit VARCHAR(20) COMMENT '单位',
    warning_quantity DECIMAL(10,2) COMMENT '预警数量',
    stock_status INT DEFAULT 0 COMMENT '库存状态：0-充足 1-预警 2-缺货',
    rust_proof INT DEFAULT 0 COMMENT '是否需要防锈：0-否 1-是',
    rust_proof_days INT COMMENT '防锈周期(天)',
    in_warehouse_time DATETIME COMMENT '入库时间',
    next_rust_proof_time DATETIME COMMENT '下次防锈时间',
    remark VARCHAR(1000) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    INDEX idx_batch_no (batch_no),
    INDEX idx_stock_status (stock_status),
    INDEX idx_next_rust_proof_time (next_rust_proof_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='特种钢材原料表';

CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '品类ID',
    category_name VARCHAR(100) COMMENT '品类名称',
    quantity DECIMAL(10,2) COMMENT '生产数量',
    status INT DEFAULT 0 COMMENT '工单状态：0-已创建 1-待投产 2-下料中 3-预热中 4-锻造中 5-精修中 6-热处理中 7-研磨中 8-已完成 9-已暂停 10-已取消',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划完成时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(200) COMMENT '原料名称',
    material_usage DECIMAL(10,2) COMMENT '原料耗用金额',
    equipment_loss DECIMAL(10,2) COMMENT '设备损耗',
    energy_cost DECIMAL(10,2) COMMENT '能耗支出',
    labor_hours DECIMAL(10,2) COMMENT '工人工时/费用',
    defective_quantity DECIMAL(10,2) COMMENT '次品数量',
    defective_loss DECIMAL(10,2) COMMENT '次品损失',
    total_cost DECIMAL(10,2) COMMENT '总成本',
    process_engineer VARCHAR(50) COMMENT '工艺员',
    line_leader VARCHAR(50) COMMENT '产线组长',
    quality_inspector VARCHAR(50) COMMENT '品质巡检员',
    remark VARCHAR(1000) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='冷锻成型生产工单表';

CREATE TABLE IF NOT EXISTS cost_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_id BIGINT NOT NULL COMMENT '品类ID',
    category_name VARCHAR(100) COMMENT '品类名称',
    report_year INT NOT NULL COMMENT '统计年份',
    report_quarter INT NOT NULL COMMENT '统计季度',
    report_month INT COMMENT '统计月份',
    total_material_cost DECIMAL(12,2) COMMENT '原料耗用总额',
    total_equipment_loss DECIMAL(12,2) COMMENT '设备损耗总额',
    total_energy_cost DECIMAL(12,2) COMMENT '能耗支出总额',
    total_labor_cost DECIMAL(12,2) COMMENT '人工费用总额',
    total_defective_loss DECIMAL(12,2) COMMENT '次品损失总额',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    total_quantity DECIMAL(10,2) COMMENT '总产量',
    work_order_count INT COMMENT '工单数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识：0-未删除 1-已删除',
    UNIQUE KEY uk_category_period (category_id, report_year, report_quarter),
    INDEX idx_report_year (report_year),
    INDEX idx_report_quarter (report_quarter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产制造成本汇总表';

INSERT INTO sys_user (username, password, real_name, phone, email, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800138000', 'admin@bearing.com', 5, 1),
('purchaser', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138001', 'purchaser@bearing.com', 1, 1),
('engineer', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800138002', 'engineer@bearing.com', 2, 1),
('leader', 'e10adc3949ba59abbe56e057f20f883e', '王五', '13800138003', 'leader@bearing.com', 3, 1),
('inspector', 'e10adc3949ba59abbe56e057f20f883e', '赵六', '13800138004', 'inspector@bearing.com', 4, 1);

INSERT INTO bearing_category (category_code, category_name, parent_id, level, sort, priority, status, specification, material) VALUES
('BC001', '深沟球轴承圈', 0, 1, 1, 100, 1, '标准深沟球系列', 'GCr15轴承钢'),
('BC001001', '6000系列深沟球轴承圈', 1, 2, 1, 90, 1, '6000-6015规格', 'GCr15轴承钢'),
('BC001002', '6200系列深沟球轴承圈', 1, 2, 2, 95, 1, '6200-6215规格', 'GCr15轴承钢'),
('BC002', '圆锥滚子轴承圈', 0, 1, 2, 80, 1, '标准圆锥滚子系列', 'GCr15轴承钢'),
('BC002001', '30200系列圆锥滚子轴承圈', 4, 2, 1, 85, 1, '30202-30220规格', 'GCr15轴承钢'),
('BC003', '调心轴承圈', 0, 1, 3, 70, 1, '标准调心系列', 'GCr15SiMn轴承钢'),
('BC004', '非标定制轴承套圈', 0, 1, 4, 110, 1, '客户定制系列', '多种材质');
