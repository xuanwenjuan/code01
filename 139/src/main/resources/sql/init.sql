CREATE DATABASE IF NOT EXISTS snack_trace DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE snack_trace;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role TINYINT NOT NULL COMMENT '角色：0-管理员，1-采购员，2-研发员，3-班组长，4-品控员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_type TINYINT NOT NULL COMMENT '分类类型：1-坚果炒货，2-肉干卤味，3-果脯蜜饯，4-膨化食品',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    product_code VARCHAR(50) UNIQUE COMMENT '产品编码',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    priority INT DEFAULT 0 COMMENT '产销优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架停售，1-在售',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) UNIQUE COMMENT '原料编码',
    material_type TINYINT NOT NULL COMMENT '原料类型：1-坚果果仁，2-生鲜肉类，3-食用果蔬，4-调味辅料',
    specification VARCHAR(200) COMMENT '规格品级',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    status TINYINT DEFAULT 1 COMMENT '状态：1-库存充足，2-库存预警，3-暂停采购',
    need_refrigeration TINYINT DEFAULT 0 COMMENT '是否需要冷藏：0-否，1-是',
    shelf_life_days INT COMMENT '保质期天数',
    supplier VARCHAR(200) COMMENT '供应商',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_code VARCHAR(50) UNIQUE NOT NULL COMMENT '批次溯源码',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    production_date DATE COMMENT '生产日期',
    expire_date DATE COMMENT '到期日期',
    supplier VARCHAR(100) COMMENT '供应商',
    inbound_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在库，2-使用中，3-已用完，4-已过期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_expire_date (expire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料批次表';

CREATE TABLE material_stock_flow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '流水ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    work_order_id BIGINT COMMENT '工单ID',
    flow_type TINYINT NOT NULL COMMENT '类型：1-入库，2-领料，3-退料，4-盘点',
    quantity DECIMAL(10,2) NOT NULL COMMENT '变动数量',
    before_quantity DECIMAL(10,2) COMMENT '变动前数量',
    after_quantity DECIMAL(10,2) COMMENT '变动后数量',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存流水表';

CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单编号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    plan_quantity DECIMAL(10,2) NOT NULL COMMENT '计划生产数量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际生产数量',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待开始，2-筛选清洗中，3-入味腌制中，4-烘烤炒制中，5-杀菌处理中，6-分装打包中，7-贴标中，8-已完成，9-已搁置',
    team_leader_id BIGINT COMMENT '班组长ID',
    team_leader_name VARCHAR(50) COMMENT '班组长姓名',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    complete_time DATETIME COMMENT '完成时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_code VARCHAR(50) COMMENT '批次编码',
    plan_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '计划用量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料使用表';

CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_stage TINYINT NOT NULL COMMENT '工序阶段',
    process_name VARCHAR(50) COMMENT '工序名称',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    team_leader_id BIGINT COMMENT '班组长ID',
    team_leader_name VARCHAR(50) COMMENT '班组长姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    process_status TINYINT DEFAULT 1 COMMENT '状态：1-进行中，2-已完成',
    process_params TEXT COMMENT '工艺参数',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序记录表';

CREATE TABLE qc_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '巡检ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    inspector_id BIGINT NOT NULL COMMENT '品控员ID',
    inspector_name VARCHAR(50) COMMENT '品控员姓名',
    inspection_stage TINYINT NOT NULL COMMENT '巡检阶段：1-原料检查，2-过程检查，3-成品检查',
    inspection_result TINYINT NOT NULL COMMENT '检查结果：1-合格，2-不合格',
    check_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '检查数量',
    qualified_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '合格数量',
    defect_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '不合格数量',
    defect_reason TEXT COMMENT '不合格原因',
    remark TEXT COMMENT '备注',
    inspection_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '巡检时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_inspector_id (inspector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品控巡检表';

CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成本ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    category_id BIGINT COMMENT '分类ID',
    material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '原料成本',
    equipment_cost DECIMAL(10,2) DEFAULT 0 COMMENT '设备能耗',
    packaging_cost DECIMAL(10,2) DEFAULT 0 COMMENT '包装物料',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '人工成本',
    defect_cost DECIMAL(10,2) DEFAULT 0 COMMENT '损耗成本',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    cost_date DATE COMMENT '统计日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_work_order (work_order_id),
    INDEX idx_category_id (category_id),
    INDEX idx_cost_date (cost_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本核算表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_type VARCHAR(20) COMMENT '操作类型',
    operation_desc TEXT COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '123456', '系统管理员', '13800138000', 0, 1),
('purchaser01', '123456', '采购员张三', '13800138001', 1, 1),
('rd01', '123456', '研发员李四', '13800138002', 2, 1),
('leader01', '123456', '班组长王五', '13800138003', 3, 1),
('qc01', '123456', '品控员赵六', '13800138004', 4, 1);

INSERT INTO product_category (parent_id, category_name, category_type, sort_order) VALUES
(0, '坚果炒货类', 1, 1),
(0, '肉干卤味类', 2, 2),
(0, '果脯蜜饯类', 3, 3),
(0, '膨化休闲食品', 4, 4),
(1, '腰果系列', 1, 1),
(1, '杏仁系列', 1, 2),
(2, '牛肉干系列', 2, 1),
(2, '猪肉脯系列', 2, 2),
(3, '芒果干系列', 3, 1),
(3, '草莓干系列', 3, 2),
(4, '薯片系列', 4, 1),
(4, '虾条系列', 4, 2);

INSERT INTO product (category_id, product_name, product_code, specification, unit, priority, status) VALUES
(5, '原味腰果', 'YG001', '250g/袋', '袋', 10, 1),
(5, '炭烧腰果', 'YG002', '250g/袋', '袋', 8, 1),
(6, '原味杏仁', 'XR001', '200g/袋', '袋', 9, 1),
(7, '五香牛肉干', 'NRG001', '180g/袋', '袋', 10, 1),
(7, '香辣牛肉干', 'NRG002', '180g/袋', '袋', 9, 1),
(9, '芒果干', 'MG001', '300g/袋', '袋', 8, 1),
(11, '原味薯片', 'SP001', '150g/袋', '袋', 7, 1);

INSERT INTO material (material_name, material_code, material_type, specification, unit, quantity, warning_quantity, unit_price, status, need_refrigeration, shelf_life_days, supplier) VALUES
('腰果仁', 'YGR001', 1, 'A级', 'kg', 500, 100, 50.00, 1, 0, 180, '越南坚果供应商'),
('杏仁', 'XR001', 1, '特级', 'kg', 300, 80, 45.00, 1, 0, 180, '美国杏仁进口商'),
('新鲜牛肉', 'XN001', 2, '牛后腿肉', 'kg', 200, 50, 80.00, 1, 1, 7, '本地肉类加工厂'),
('新鲜猪肉', 'XZ001', 2, '猪瘦肉', 'kg', 150, 40, 35.00, 1, 1, 7, '本地肉类加工厂'),
('芒果', 'MG001', 3, '台农芒', 'kg', 400, 100, 15.00, 1, 1, 14, '海南水果基地'),
('白砂糖', 'BST001', 4, '一级', 'kg', 1000, 200, 8.00, 1, 0, 365, '本地糖厂'),
('食用盐', 'SYY001', 4, '精制盐', 'kg', 500, 100, 3.00, 1, 0, 730, '盐业公司'),
('辣椒粉', 'LJF001', 4, '特辣', 'kg', 100, 20, 25.00, 1, 0, 180, '四川调料厂');
