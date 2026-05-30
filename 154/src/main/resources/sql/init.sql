-- 创建数据库
CREATE DATABASE IF NOT EXISTS fastener_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fastener_production;

-- 系统角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    remark VARCHAR(200) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(200) COMMENT '头像',
    role_id BIGINT COMMENT '角色ID',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    remark VARCHAR(200) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 产品分类表
CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID 0-顶级分类',
    level TINYINT DEFAULT 1 COMMENT '分类层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常生产 2-停产归档 3-外协排产',
    priority TINYINT DEFAULT 0 COMMENT '外协排产优先级 0-普通 1-紧急 2-特急',
    specification VARCHAR(200) COMMENT '规格型号',
    material VARCHAR(100) COMMENT '材质要求',
    standard VARCHAR(100) COMMENT '执行标准',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_code (category_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 金属原料表
CREATE TABLE IF NOT EXISTS metal_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    material_type TINYINT NOT NULL COMMENT '原料类型 1-不锈钢圆钢 2-碳钢线材 3-合金棒料 4-镀锌辅料 5-防锈助剂',
    specification VARCHAR(200) COMMENT '规格型号',
    material_grade VARCHAR(100) COMMENT '材质牌号',
    origin VARCHAR(100) COMMENT '产地',
    supplier VARCHAR(100) COMMENT '供应商',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '计量单位',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存量',
    rust_proof_cycle INT DEFAULT 0 COMMENT '防锈周期(天)，碳钢专用',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常库存 2-库存预警 3-停止采购',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_material_type (material_type),
    INDEX idx_material_code (material_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='金属原料表';

-- 原料库存批次表
CREATE TABLE IF NOT EXISTS material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码(自动生成)',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    available_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '可用数量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '入库单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    inbound_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
    production_date DATE COMMENT '生产日期',
    expiration_date DATE COMMENT '过期日期(防锈期)',
    warehouse_code VARCHAR(50) COMMENT '仓库编码',
    location_code VARCHAR(50) COMMENT '库位编码',
    inspector VARCHAR(50) COMMENT '检验员',
    inspection_result VARCHAR(200) COMMENT '检验结果',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-部分出库 3-已用完 4-已过期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_code (batch_code),
    INDEX idx_inbound_time (inbound_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存批次表';

-- 原料出入库记录表
CREATE TABLE IF NOT EXISTS material_stock_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '单据编号',
    record_type TINYINT NOT NULL COMMENT '类型 1-入库 2-出库',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_id BIGINT COMMENT '批次ID',
    batch_code VARCHAR(50) COMMENT '批次编码',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '金额',
    work_order_id BIGINT COMMENT '关联工单ID',
    operator VARCHAR(50) COMMENT '经办人',
    operate_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_record_type (record_type),
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_operate_time (operate_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料出入库记录表';

-- 冷镦加工工单表
CREATE TABLE IF NOT EXISTS cold_heading_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品名称',
    specification VARCHAR(200) COMMENT '规格型号',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际完成数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_usage DECIMAL(10,2) DEFAULT 0 COMMENT '原料耗用量',
    work_center VARCHAR(50) COMMENT '工作中心',
    machine_code VARCHAR(50) COMMENT '机床编码',
    operator VARCHAR(50) COMMENT '操作工',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划完成日期',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    status TINYINT DEFAULT 0 COMMENT '工单状态 0-待开始 1-拉直切断 2-冷镦成型 3-螺纹滚压 4-表面镀锌 5-淬火调质 6-尺寸全检 7-防锈打包 8-成品入库 9-已冻结 10-已取消',
    priority TINYINT DEFAULT 0 COMMENT '优先级 0-普通 1-紧急 2-特急',
    process_remark TEXT COMMENT '工艺说明',
    quality_standard TEXT COMMENT '质量标准',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_plan_start_date (plan_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='冷镦加工工单表';

-- 工单工序流转记录表
CREATE TABLE IF NOT EXISTS work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_status TINYINT DEFAULT 0 COMMENT '工序状态 0-未开始 1-进行中 2-已完成',
    operator VARCHAR(50) COMMENT '操作工',
    work_center VARCHAR(50) COMMENT '工作中心',
    machine_code VARCHAR(50) COMMENT '机床编码',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    process_duration DECIMAL(8,2) DEFAULT 0 COMMENT '加工时长(小时)',
    input_quantity INT DEFAULT 0 COMMENT '投入数量',
    output_quantity INT DEFAULT 0 COMMENT '产出数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    process_params TEXT COMMENT '工艺参数',
    inspection_result TEXT COMMENT '检验结果',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_code (process_code),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序流转记录表';

-- 生产费用记录表
CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    cost_no VARCHAR(50) NOT NULL UNIQUE COMMENT '费用编号',
    cost_type TINYINT NOT NULL COMMENT '费用类型 1-原料耗用 2-模具磨损 3-机床用电 4-生产工时 5-报废损耗',
    work_order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    category_id BIGINT COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品名称',
    amount DECIMAL(12,2) NOT NULL COMMENT '费用金额',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '数量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    cost_date DATE COMMENT '费用日期',
    operator VARCHAR(50) COMMENT '经办人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_cost_type (cost_type),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_cost_date (cost_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产费用记录表';

-- 月度生产统计报表
CREATE TABLE IF NOT EXISTS monthly_production_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    report_month VARCHAR(7) NOT NULL COMMENT '统计月份 yyyy-MM',
    total_orders INT DEFAULT 0 COMMENT '总工单数',
    completed_orders INT DEFAULT 0 COMMENT '完成工单数',
    total_quantity INT DEFAULT 0 COMMENT '总生产数量',
    total_scrap_quantity INT DEFAULT 0 COMMENT '总报废数量',
    scrap_rate DECIMAL(5,2) DEFAULT 0 COMMENT '报废率(%)',
    total_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料总成本',
    total_mold_cost DECIMAL(12,2) DEFAULT 0 COMMENT '模具总成本',
    total_electricity_cost DECIMAL(12,2) DEFAULT 0 COMMENT '用电总成本',
    total_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '工时总成本',
    total_scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废总成本',
    total_cost DECIMAL(14,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    total_working_hours DECIMAL(10,2) DEFAULT 0 COMMENT '总工时',
    efficiency DECIMAL(8,2) DEFAULT 0 COMMENT '生产效率(件/小时)',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_report_month (report_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度生产统计报表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    log_no VARCHAR(50) NOT NULL UNIQUE COMMENT '日志编号',
    operation_type TINYINT NOT NULL COMMENT '操作类型 1-新增 2-修改 3-删除 4-查询 5-状态变更 6-原料入库 7-原料出库 8-工单启动 9-工序流转 10-质检操作 11-成本核算',
    module_code VARCHAR(50) COMMENT '模块编码',
    module_name VARCHAR(100) COMMENT '模块名称',
    business_id BIGINT COMMENT '业务ID',
    business_no VARCHAR(100) COMMENT '业务编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '客户端信息',
    request_url VARCHAR(200) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    cost_time BIGINT DEFAULT 0 COMMENT '耗时(毫秒)',
    status TINYINT DEFAULT 1 COMMENT '状态 1-成功 0-失败',
    error_msg TEXT COMMENT '错误信息',
    remark VARCHAR(500) COMMENT '备注',
    INDEX idx_operation_type (operation_type),
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time),
    INDEX idx_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化数据
INSERT INTO sys_role (role_name, role_code, status, remark) VALUES
('管理员', 'admin', 1, '系统管理员，拥有所有权限'),
('物料采购员', 'material:purchase', 1, '负责物料采购和仓储管理'),
('工艺编制员', 'process:compile', 1, '负责工艺编制和工单安排'),
('产线管理员', 'production:manage', 1, '负责生产车间和工单管理'),
('成品质检员', 'quality:inspection', 1, '负责质量检验和成品管理');

INSERT INTO sys_user (username, password, real_name, phone, role_id, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 1, 1),
('buyer01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', '13800138001', 2, 1),
('process01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', '13800138002', 3, 1),
('production01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王五', '13800138003', 4, 1),
('quality01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵六', '13800138004', 5, 1);

-- 初始化产品分类数据
INSERT INTO product_category (category_name, category_code, parent_id, level, sort_order, status, specification, material, standard, remark) VALUES
('螺栓系列', 'BOLT', 0, 1, 1, 1, '', '', 'GB/T', '螺栓类产品总分类'),
('螺母系列', 'NUT', 0, 1, 2, 1, '', '', 'GB/T', '螺母类产品总分类'),
('垫圈系列', 'WASHER', 0, 1, 3, 1, '', '', 'GB/T', '垫圈类产品总分类'),
('异形非标紧固件', 'SPECIAL', 0, 1, 4, 1, '', '', '客户定制', '异形非标类产品总分类');

INSERT INTO product_category (category_name, category_code, parent_id, level, sort_order, status, specification, material, standard, remark) VALUES
('外六角螺栓', 'BOLT-HEX', 1, 2, 1, 1, 'M6-M36', '碳钢、不锈钢', 'GB/T 5782', '外六角头螺栓'),
('内六角螺栓', 'BOLT-SOCKET', 1, 2, 2, 1, 'M3-M24', '碳钢、不锈钢', 'GB/T 70.1', '内六角圆柱头螺钉'),
('六角螺母', 'NUT-HEX', 2, 2, 1, 1, 'M6-M36', '碳钢、不锈钢', 'GB/T 6170', '六角薄螺母'),
('平垫圈', 'WASHER-FLAT', 3, 2, 1, 1, 'Φ6-Φ36', '碳钢、不锈钢', 'GB/T 97.1', '平垫圈A级');

-- 初始化原料数据
INSERT INTO metal_material (material_name, material_code, material_type, specification, material_grade, origin, supplier, unit, unit_price, warning_quantity, rust_proof_cycle, status, remark) VALUES
('304不锈钢圆钢', 'SS304-001', 1, 'Φ8mm', '304', '太原钢铁', '太钢集团', 'kg', 28.50, 500, 0, 1, '常用不锈钢原料'),
('316不锈钢圆钢', 'SS316-001', 1, 'Φ10mm', '316L', '太原钢铁', '太钢集团', 'kg', 45.00, 300, 0, 1, '耐腐蚀不锈钢'),
('45#碳钢线材', 'CS45-001', 2, 'Φ6.5mm', '45#', '宝钢集团', '宝钢股份', 'kg', 8.50, 1000, 90, 1, '优质碳素结构钢'),
('35K碳钢线材', 'CS35K-001', 2, 'Φ8mm', '35K', '宝钢集团', '宝钢股份', 'kg', 7.80, 1200, 90, 1, '冷镦钢专用'),
('40Cr合金棒料', 'AS40Cr-001', 3, 'Φ12mm', '40Cr', '鞍钢集团', '鞍钢股份', 'kg', 12.50, 400, 0, 1, '合金结构钢'),
('环保镀锌剂', 'GALV-001', 4, '25kg/桶', '环保型', '武汉材保', '武汉材料保护所', 'kg', 15.00, 200, 0, 1, '三价铬镀锌'),
('防锈油', 'RUST-001', 5, '200L/桶', 'F20-1', '长城润滑油', '中石化', 'L', 28.00, 100, 0, 1, '长期防锈油');
