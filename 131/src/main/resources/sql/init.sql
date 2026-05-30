-- 创建数据库
CREATE DATABASE IF NOT EXISTS compressor_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE compressor_db;

-- 用户表
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role TINYINT NOT NULL COMMENT '角色:1-采购,2-工艺员,3-产线组长,4-质检员,99-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 外壳分类表
CREATE TABLE shell_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level TINYINT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '排产优先级',
    status TINYINT DEFAULT 1 COMMENT '状态:0-停产,1-正常',
    description VARCHAR(500) COMMENT '描述',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空压机外壳类目表';

-- 原料表
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) UNIQUE COMMENT '原料编码',
    batch_no VARCHAR(50) UNIQUE COMMENT '批次号',
    material_type TINYINT NOT NULL COMMENT '类型:1-冷轧钢板,2-镀锌板材,3-喷涂专用板,4-加固连接辅料',
    material_texture VARCHAR(100) COMMENT '材质',
    spec VARCHAR(200) COMMENT '规格型号',
    thickness DECIMAL(10,2) COMMENT '厚度(mm)',
    width DECIMAL(10,2) COMMENT '宽度(mm)',
    length DECIMAL(10,2) COMMENT '长度(mm)',
    unit VARCHAR(20) DEFAULT '张' COMMENT '单位',
    total_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '总数量',
    available_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '可用数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    status TINYINT DEFAULT 1 COMMENT '状态:1-库存充足,2-库存预警,3-停止采购',
    is_outdoor TINYINT DEFAULT 0 COMMENT '是否露天存放:0-否,1-是',
    moisture_proof_days INT DEFAULT 30 COMMENT '防潮防锈周期(天)',
    last_check_date DATE COMMENT '上次检查日期',
    next_check_date DATE COMMENT '下次检查日期',
    warehouse_location VARCHAR(100) COMMENT '库位',
    supplier VARCHAR(100) COMMENT '供应商',
    inbound_date DATE COMMENT '入库日期',
    description VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钣金板材原料表';

-- 生产工单表
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    category_id BIGINT NOT NULL COMMENT '外壳分类ID',
    category_name VARCHAR(100) COMMENT '外壳分类名称',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际生产数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良数量',
    status TINYINT DEFAULT 1 COMMENT '状态:1-待排产,2-已排产,3-剪板中,4-折弯中,5-冲孔中,6-点焊中,7-打磨中,8-喷涂中,9-组装中,10-质检中,11-已完成,12-已暂停,13-已取消',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    process_engineer_id BIGINT COMMENT '工艺员ID',
    process_engineer_name VARCHAR(50) COMMENT '工艺员姓名',
    production_leader_id BIGINT COMMENT '产线组长ID',
    production_leader_name VARCHAR(50) COMMENT '产线组长姓名',
    inspector_id BIGINT COMMENT '质检员ID',
    inspector_name VARCHAR(50) COMMENT '质检员姓名',
    process_confirmed TINYINT DEFAULT 0 COMMENT '工艺是否确认:0-未确认,1-已确认',
    process_engineer_time DATETIME COMMENT '工艺确认时间',
    priority INT DEFAULT 0 COMMENT '优先级',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钣金折弯生产工单表';

-- 原料库存锁定表
CREATE TABLE material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '锁定ID',
    lock_no VARCHAR(50) UNIQUE NOT NULL COMMENT '锁定单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    lock_status TINYINT DEFAULT 1 COMMENT '锁定状态:1-已锁定,2-已释放,3-已消耗',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存锁定表';

-- 工单原料领用明细表
CREATE TABLE order_material_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    detail_no VARCHAR(50) UNIQUE NOT NULL COMMENT '明细单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    material_type TINYINT COMMENT '原料类型',
    spec VARCHAR(200) COMMENT '规格',
    receive_quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    actual_usage DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    return_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '退回数量',
    loss_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    receiver_id BIGINT COMMENT '领用人ID',
    receiver_name VARCHAR(50) COMMENT '领用人姓名',
    status TINYINT DEFAULT 1 COMMENT '状态:1-已领用,2-部分使用,3-已完成',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料领用明细表';

-- 生产损耗记录表
CREATE TABLE production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '损耗ID',
    loss_no VARCHAR(50) UNIQUE NOT NULL COMMENT '损耗单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    category_id BIGINT COMMENT '分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    loss_type TINYINT NOT NULL COMMENT '损耗类型:1-材料损耗,2-设备损耗,3-人工损耗,4-次品损耗,5-其他损耗',
    loss_name VARCHAR(100) COMMENT '损耗名称',
    loss_quantity DECIMAL(10,2) COMMENT '损耗数量',
    loss_amount DECIMAL(12,2) NOT NULL COMMENT '损耗金额',
    loss_rate DECIMAL(5,2) COMMENT '损耗率(%)',
    unit_price DECIMAL(10,2) COMMENT '单价',
    handler_id BIGINT COMMENT '处理人ID',
    handler_name VARCHAR(50) COMMENT '处理人姓名',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_loss_type (loss_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗记录表';

-- 生产成本统计表
CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成本ID',
    cost_no VARCHAR(50) UNIQUE NOT NULL COMMENT '成本单号',
    category_id BIGINT NOT NULL COMMENT '外壳分类ID',
    category_name VARCHAR(100) COMMENT '外壳分类名称',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    production_quantity INT COMMENT '生产数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备损耗成本',
    spray_cost DECIMAL(12,2) DEFAULT 0 COMMENT '喷塑物料成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良报废成本',
    other_cost DECIMAL(12,2) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    cost_date DATE COMMENT '统计日期',
    quarter VARCHAR(20) COMMENT '季度',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_category_id (category_id),
    INDEX idx_quarter (quarter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本统计表';

-- 操作日志表
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    log_no VARCHAR(50) UNIQUE NOT NULL COMMENT '日志编号',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    business_id BIGINT COMMENT '业务ID',
    business_no VARCHAR(50) COMMENT '业务单号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_role TINYINT COMMENT '操作人角色',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)',
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入默认用户数据 (密码: admin123，需要使用BCrypt加密)
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000', 99, 1),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张三', '13800138001', 1, 1),
('engineer01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李四', '13800138002', 2, 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王五', '13800138003', 3, 1),
('inspector01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵六', '13800138004', 4, 1);

-- 插入外壳分类示例数据
INSERT INTO shell_category (category_name, category_code, parent_id, level, sort_order, priority, status, description) VALUES
('便携式空压机壳', 'PORTABLE', 0, 1, 1, 10, 1, '便携式空压机外壳系列'),
('手提式空压机壳', 'PORTABLE-HAND', 1, 2, 1, 15, 1, '手提式小型空压机外壳'),
('背包式空压机壳', 'PORTABLE-BAG', 1, 2, 2, 12, 1, '背包式便携空压机外壳'),
('工业立式机壳', 'INDUSTRIAL', 0, 1, 2, 20, 1, '工业立式空压机外壳系列'),
('小型立式机壳', 'INDUSTRIAL-S', 4, 2, 1, 18, 1, '小型工业立式空压机外壳'),
('大型立式机壳', 'INDUSTRIAL-L', 4, 2, 2, 25, 1, '大型工业立式空压机外壳'),
('静音款外壳', 'SILENT', 0, 1, 3, 30, 1, '静音款空压机外壳系列'),
('家用静音外壳', 'SILENT-HOME', 7, 2, 1, 28, 1, '家用静音空压机外壳'),
('医用静音外壳', 'SILENT-MED', 7, 2, 2, 35, 1, '医用静音空压机外壳'),
('定制异形壳体', 'CUSTOM', 0, 1, 4, 50, 1, '客户定制异形壳体');
