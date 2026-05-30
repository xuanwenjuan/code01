CREATE DATABASE IF NOT EXISTS impeller_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE impeller_production;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：PURCHASER-采购员,PROCESS-工艺员,TEAM_LEADER-班组长,INSPECTOR-巡检员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用,1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架,1-上架',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='叶轮产品类目表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '批次编号',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型：PIG_IRON-生铁,ALLOY-合金,FOUNDRY_SAND-铸造砂,BINDER-粘结剂,QUENCHING-淬火助剂',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：NORMAL-库存充足,WARNING-库存预警,STOP-停止采购',
    is_easy_clumping TINYINT DEFAULT 0 COMMENT '是否易结块：0-否,1-是',
    storage_days INT COMMENT '存放天数（易结块物料）',
    production_date DATE COMMENT '生产日期',
    supplier VARCHAR(200) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_type (material_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铸造原辅物料表';

CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    work_order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    product_category_id BIGINT NOT NULL COMMENT '产品类目ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    planned_quantity INT NOT NULL COMMENT '计划数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际数量',
    defective_quantity INT DEFAULT 0 COMMENT '次品数量',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待开炉,MELTING-熔炼浇筑中,SAND_MOLDING-砂型成型中,COOLING-冷却脱壳中,GRINDING-粗打磨修整中,BALANCING-动平衡校正中,ANTIRUST-防锈处理中,FINISHED-已入库,FROZEN-已冻结',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    finish_time DATETIME COMMENT '完成时间',
    process_user_id BIGINT COMMENT '工艺员ID',
    team_leader_id BIGINT COMMENT '班组长ID',
    inspector_id BIGINT COMMENT '巡检员ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_work_order_no (work_order_no),
    INDEX idx_status (status),
    INDEX idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铸造加工生产工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit VARCHAR(20) COMMENT '单位',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料使用表';

CREATE TABLE production_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_content TEXT COMMENT '操作内容',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    operator_role VARCHAR(50) NOT NULL COMMENT '操作人角色',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产操作日志表';

CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    product_category_id BIGINT NOT NULL COMMENT '产品类目ID',
    product_category_name VARCHAR(100) NOT NULL COMMENT '产品类目名称',
    raw_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    sand_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '砂料成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '次品损耗成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0-否,1-是',
    UNIQUE KEY uk_date_category (statistics_date, product_category_id),
    INDEX idx_statistics_date (statistics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铸造生产成本台账表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000', 'ADMIN', 1),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '采购员张三', '13800138001', 'PURCHASER', 1),
('process01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '工艺员李四', '13800138002', 'PROCESS', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '班组长王五', '13800138003', 'TEAM_LEADER', 1),
('inspector01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '巡检员赵六', '13800138004', 'INSPECTOR', 1);

INSERT INTO product_category (parent_id, category_name, category_code, sort_order, status, description) VALUES
(0, '离心风机叶轮', 'CENTRIFUGAL', 1, 1, '离心风机用叶轮'),
(0, '轴流风机叶轮', 'AXIAL', 2, 1, '轴流风机用叶轮'),
(0, '防腐合金叶轮', 'ANTICORROSIVE', 3, 1, '防腐合金材质叶轮'),
(0, '高温耐磨叶轮', 'HIGH_TEMP', 4, 1, '高温耐磨材质叶轮'),
(1, '碳钢离心叶轮', 'CENTRIFUGAL_CARBON', 1, 1, '碳钢材质离心叶轮'),
(1, '不锈钢离心叶轮', 'CENTRIFUGAL_STAINLESS', 2, 1, '不锈钢材质离心叶轮'),
(2, '铸钢轴流叶轮', 'AXIAL_STEEL', 1, 1, '铸钢材质轴流叶轮'),
(2, '铝合金轴流叶轮', 'AXIAL_ALUMINUM', 2, 1, '铝合金材质轴流叶轮');
