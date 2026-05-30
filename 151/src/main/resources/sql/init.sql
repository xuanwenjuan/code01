CREATE DATABASE IF NOT EXISTS stationery_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE stationery_manufacture;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0未删除 1已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    ancestors VARCHAR(500) COMMENT '祖级列表',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0下架 1上架',
    description VARCHAR(500) COMMENT '描述',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

DROP TABLE IF EXISTS material_stock;
CREATE TABLE material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) COMMENT '物料类型',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '预警数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    stock_status TINYINT DEFAULT 1 COMMENT '库存状态 1正常 2预警',
    purchase_status TINYINT DEFAULT 1 COMMENT '采购状态 1正常 2待采购 3暂停采购',
    moisture_proof TINYINT DEFAULT 0 COMMENT '是否防潮 0否 1是',
    storage_location VARCHAR(200) COMMENT '存储位置',
    production_date DATE COMMENT '生产日期',
    expire_date DATE COMMENT '有效期至',
    supplier VARCHAR(100) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

DROP TABLE IF EXISTS production_order;
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品分类名称',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    specification VARCHAR(500) COMMENT '规格说明',
    quantity INT NOT NULL COMMENT '生产数量',
    priority INT DEFAULT 1 COMMENT '优先级 1普通 2紧急 3特急',
    order_status TINYINT DEFAULT 0 COMMENT '工单状态 0待排产 1已排产 2生产中 3生产完成 4待质检 5质检完成 6已完结 9已暂停',
    customer_name VARCHAR(100) COMMENT '客户名称',
    customer_contact VARCHAR(50) COMMENT '客户联系方式',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划完成时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    design_user_id BIGINT COMMENT '设计员ID',
    design_user_name VARCHAR(50) COMMENT '设计员姓名',
    production_user_id BIGINT COMMENT '生产组长ID',
    production_user_name VARCHAR(50) COMMENT '生产组长姓名',
    inspection_user_id BIGINT COMMENT '质检员ID',
    inspection_user_name VARCHAR(50) COMMENT '质检员姓名',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    defective_quantity INT DEFAULT 0 COMMENT '不合格数量',
    design_requirements TEXT COMMENT '设计要求',
    remark VARCHAR(1000) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

DROP TABLE IF EXISTS order_process;
CREATE TABLE order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_sort INT NOT NULL COMMENT '工序顺序',
    process_status TINYINT DEFAULT 0 COMMENT '工序状态 0未开始 1进行中 2已完成',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    working_hours DECIMAL(8,2) COMMENT '工时',
    process_remark VARCHAR(500) COMMENT '工序备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

DROP TABLE IF EXISTS order_material;
CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    planned_quantity DECIMAL(12,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(12,2) DEFAULT 0 COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

DROP TABLE IF EXISTS cost_statistics;
CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    product_name VARCHAR(200) COMMENT '产品名称',
    quantity INT COMMENT '生产数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    rework_cost DECIMAL(12,2) DEFAULT 0 COMMENT '改版损耗成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '残次成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位成本',
    period VARCHAR(20) COMMENT '统计月份',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

DROP TABLE IF EXISTS stock_inbound;
CREATE TABLE stock_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    inbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(12,2) NOT NULL COMMENT '入库数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(12,2) DEFAULT 0 COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    supplier VARCHAR(100) COMMENT '供应商',
    warehouse VARCHAR(50) COMMENT '仓库',
    remark VARCHAR(500) COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态 1待确认 2已确认',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单表';

DROP TABLE IF EXISTS stock_outbound;
CREATE TABLE stock_outbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    outbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    outbound_type VARCHAR(50) COMMENT '出库类型',
    related_order_id BIGINT COMMENT '关联工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(12,2) NOT NULL COMMENT '出库数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(12,2) DEFAULT 0 COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    warehouse VARCHAR(50) COMMENT '仓库',
    receiver VARCHAR(50) COMMENT '领用人',
    remark VARCHAR(500) COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态 1待确认 2已确认',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库单表';

DROP TABLE IF EXISTS stock_flow;
CREATE TABLE stock_flow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    flow_no VARCHAR(50) NOT NULL UNIQUE COMMENT '流水号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    flow_type VARCHAR(20) NOT NULL COMMENT '流水类型 IN入库 OUT出库',
    before_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '变动前数量',
    change_quantity DECIMAL(12,2) NOT NULL COMMENT '变动数量',
    after_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '变动后数量',
    related_no VARCHAR(50) COMMENT '关联单号',
    related_type VARCHAR(50) COMMENT '关联类型',
    remark VARCHAR(500) COMMENT '备注',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存流水表';

DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(100) COMMENT '模块',
    operation VARCHAR(200) COMMENT '操作',
    method VARCHAR(500) COMMENT '方法名',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_role VARCHAR(50) COMMENT '操作人角色',
    ip VARCHAR(50) COMMENT 'IP地址',
    operate_time DATETIME COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态 1成功 0失败',
    error_msg VARCHAR(1000) COMMENT '错误信息'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

DROP TABLE IF EXISTS stock_lock;
CREATE TABLE stock_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    lock_no VARCHAR(50) NOT NULL UNIQUE COMMENT '锁定单号',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    lock_quantity DECIMAL(12,2) NOT NULL COMMENT '锁定数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(12,2) DEFAULT 0 COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    lock_status TINYINT DEFAULT 1 COMMENT '锁定状态 1锁定 0已解锁',
    lock_time DATETIME COMMENT '锁定时间',
    unlock_time DATETIME COMMENT '解锁时间',
    unlock_reason VARCHAR(500) COMMENT '解锁原因',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存锁定表';

DROP TABLE IF EXISTS production_loss;
CREATE TABLE production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    loss_no VARCHAR(50) NOT NULL UNIQUE COMMENT '损耗单号',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_id BIGINT COMMENT '工序ID',
    process_name VARCHAR(100) COMMENT '工序名称',
    material_id BIGINT COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    loss_type VARCHAR(50) COMMENT '损耗类型',
    loss_reason VARCHAR(200) COMMENT '损耗原因',
    loss_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '损耗数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    loss_amount DECIMAL(12,2) DEFAULT 0 COMMENT '损耗金额',
    remark VARCHAR(500) COMMENT '备注',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗表';

INSERT INTO sys_user (username, password, real_name, phone, email, role_code, role_name, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800000000', 'admin@stationery.com', 'ADMIN', '系统管理员', 1),
('purchaser01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', '13800000001', 'purchaser01@stationery.com', 'PURCHASER', '采购专员', 1),
('designer01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', '13800000002', 'designer01@stationery.com', 'DESIGNER', '版式设计员', 1),
('leader01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王五', '13800000003', 'leader01@stationery.com', 'PRODUCTION_LEADER', '产线组长', 1),
('inspector01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵六', '13800000004', 'inspector01@stationery.com', 'INSPECTOR', '成品质检员', 1);

INSERT INTO product_category (category_name, category_code, parent_id, ancestors, level, sort, status, description) VALUES
('书写笔类', 'WRITE_PEN', 0, '0', 1, 1, 1, '各类书写用笔'),
('本册纸品', 'NOTEBOOK', 0, '0', 1, 2, 1, '各类本册和纸品'),
('办公耗材', 'OFFICE', 0, '0', 1, 3, 1, '办公消耗用品'),
('潮流文创周边', 'CULTURAL', 0, '0', 1, 4, 1, '文创周边产品'),
('中性笔', 'GEL_PEN', 1, '0,1', 2, 1, 1, '中性签字笔'),
('钢笔', 'FOUNTAIN_PEN', 1, '0,1', 2, 2, 1, '钢笔系列'),
('笔记本', 'NOTE', 2, '0,2', 2, 1, 1, '各类笔记本'),
('信纸信封', 'LETTER', 2, '0,2', 2, 2, 1, '信纸信封套装');

INSERT INTO material_stock (material_code, material_name, material_type, batch_no, specification, unit, quantity, warning_quantity, unit_price, stock_status, purchase_status, moisture_proof, storage_location, supplier) VALUES
('WOOD_001', '原木笔杆', 'WOOD', 'WO202401010001', '枫木 12cm', '根', 5000, 500, 2.50, 1, 1, 0, 'A区-01', '木材加工厂'),
('INK_001', '黑色书写油墨', 'INK', 'IN202401010001', '速干型 500ml', '瓶', 200, 50, 45.00, 1, 1, 0, 'B区-02', '油墨供应商'),
('PAPER_001', '特种书写纸', 'PAPER', 'PA202401010001', '80g A4', '令', 500, 100, 120.00, 1, 1, 1, 'C区-03(防潮)', '纸业公司'),
('PRINT_001', '印花油墨', 'PRINT', 'PR202401010001', '环保型 1KG', '桶', 100, 20, 85.00, 1, 1, 0, 'B区-03', '印花材料商'),
('METAL_001', '五金笔夹', 'METAL', 'ME202401010001', '不锈钢', '个', 10000, 1000, 0.80, 1, 1, 0, 'D区-01', '五金配件厂');
