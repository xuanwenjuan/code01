CREATE DATABASE IF NOT EXISTS textile_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE textile_production;

-- 用户表
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：PURCHASER-采购, TECHNICIAN-工艺员, SUPERVISOR-车间组长, INSPECTOR-质检, ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 面料分类表
CREATE TABLE fabric_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    level INT DEFAULT 1 COMMENT '分类层级',
    priority INT DEFAULT 0 COMMENT '排产优先级，数值越大优先级越高',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常, 0-下架停产',
    description VARCHAR(500) COMMENT '分类描述',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面料分类表';

-- 原料表
CREATE TABLE raw_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '原料名称',
    type VARCHAR(50) NOT NULL COMMENT '原料类型：COTTON-棉纱, POLYESTER-涤纶丝, CHEMICAL-化纤坯线, DYE-染色助剂, AUXILIARY-定型辅料',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    total_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总库存数量',
    warning_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '预警数量',
    moisture_proof TINYINT DEFAULT 0 COMMENT '是否需要防潮：1-是, 0-否',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '库存状态：NORMAL-库存充足, WARNING-库存预警, STOP-停止采购',
    description VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

-- 原料批次表
CREATE TABLE raw_material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    quantity DECIMAL(12,2) NOT NULL COMMENT '批次数量',
    unit_price DECIMAL(12,2) COMMENT '单价',
    supplier VARCHAR(100) COMMENT '供应商',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期',
    warehouse_area VARCHAR(50) COMMENT '存放库区',
    humidity DECIMAL(5,2) COMMENT '当前湿度(%)',
    moisture_warning TINYINT DEFAULT 0 COMMENT '防潮预警：1-需要预警, 0-正常',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在库, 0-已用完',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_code (batch_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料批次表';

-- 生产工单表
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    category_id BIGINT NOT NULL COMMENT '面料分类ID',
    fabric_name VARCHAR(100) NOT NULL COMMENT '面料名称',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划生产数量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际生产数量',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    priority INT DEFAULT 0 COMMENT '优先级',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待开工, IN_PROGRESS-生产中, SUSPENDED-已暂停, COMPLETED-已完成, CANCELLED-已取消',
    current_process VARCHAR(50) COMMENT '当前工序',
    process_index INT DEFAULT 0 COMMENT '当前工序索引',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划完成日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际完成时间',
    timeout TINYINT DEFAULT 0 COMMENT '是否超期：1-是, 0-否',
    operator_id BIGINT COMMENT '负责人员ID',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 生产工序表
CREATE TABLE production_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称：整经/织造/印染/定型/缩水/质检/卷布',
    process_index INT NOT NULL COMMENT '工序顺序',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '工序状态：PENDING-待开始, IN_PROGRESS-进行中, COMPLETED-已完成, SKIPPED-跳过',
    operator_id BIGINT COMMENT '操作人员ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    output_quantity DECIMAL(12,2) COMMENT '产出数量',
    defective_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '次品数量',
    equipment VARCHAR(100) COMMENT '使用设备',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工序表';

-- 工单用料表
CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    unit_price DECIMAL(12,2) COMMENT '单价',
    total_price DECIMAL(14,2) COMMENT '总价',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

-- 生产日志表
CREATE TABLE production_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT COMMENT '工单ID',
    process_id BIGINT COMMENT '工序ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型：创建/开始/暂停/完成/质检/用料/入库',
    operation_content TEXT COMMENT '操作内容',
    operator_id BIGINT COMMENT '操作人员ID',
    operator_name VARCHAR(50) COMMENT '操作人员名称',
    before_status VARCHAR(20) COMMENT '操作前状态',
    after_status VARCHAR(20) COMMENT '操作后状态',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产日志表';

-- 生产成本表
CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    material_cost DECIMAL(14,2) DEFAULT 0 COMMENT '原料成本',
    equipment_cost DECIMAL(14,2) DEFAULT 0 COMMENT '设备损耗成本',
    labor_cost DECIMAL(14,2) DEFAULT 0 COMMENT '人工成本',
    dye_cost DECIMAL(14,2) DEFAULT 0 COMMENT '印染染料成本',
    process_loss_cost DECIMAL(14,2) DEFAULT 0 COMMENT '工艺损耗成本',
    shrinkage_loss_cost DECIMAL(14,2) DEFAULT 0 COMMENT '缩水损耗成本',
    energy_cost DECIMAL(14,2) DEFAULT 0 COMMENT '能源消耗成本',
    management_cost DECIMAL(14,2) DEFAULT 0 COMMENT '管理分摊成本',
    defective_cost DECIMAL(14,2) DEFAULT 0 COMMENT '残次报废成本',
    other_cost DECIMAL(14,2) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(14,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    settlement_status TINYINT DEFAULT 0 COMMENT '结算状态：0-未结算, 1-已结算',
    settlement_time DATETIME COMMENT '结算时间',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- 质检表
CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    process_id BIGINT COMMENT '工序ID',
    inspect_type VARCHAR(50) NOT NULL COMMENT '质检类型：过程质检/成品质检',
    inspect_quantity DECIMAL(12,2) NOT NULL COMMENT '抽检数量',
    qualified_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '合格数量',
    defective_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '次品数量',
    pass_rate DECIMAL(5,2) COMMENT '合格率(%)',
    defect_details TEXT COMMENT '瑕疵详情',
    inspector_id BIGINT COMMENT '质检员ID',
    inspect_result TINYINT COMMENT '质检结果：1-合格, 0-不合格',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检表';

-- 初始化用户数据（密码默认123456）
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 'ADMIN', 1),
('purchaser', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张采购', '13800138001', 'PURCHASER', 1),
('technician', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李工艺', '13800138002', 'TECHNICIAN', 1),
('supervisor', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王组长', '13800138003', 'SUPERVISOR', 1),
('inspector', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵质检', '13800138004', 'INSPECTOR', 1);

-- 初始化面料分类数据
INSERT INTO fabric_category (name, parent_id, level, priority, status, description) VALUES
('纯棉面料', 0, 1, 10, 1, '100%纯棉面料系列'),
('化纤面料', 0, 1, 8, 1, '化纤合成面料系列'),
('麻质面料', 0, 1, 6, 1, '天然麻质面料系列'),
('混纺弹力面料', 0, 1, 9, 1, '混纺弹力面料系列');

INSERT INTO fabric_category (name, parent_id, level, priority, status, description) VALUES
('平纹纯棉', 1, 2, 5, 1, '平纹组织纯棉面料'),
('斜纹纯棉', 1, 2, 6, 1, '斜纹组织纯棉面料'),
('缎纹纯棉', 1, 2, 4, 1, '缎纹组织纯棉面料'),
('涤纶面料', 2, 2, 5, 1, '纯涤纶面料'),
('锦纶面料', 2, 2, 4, 1, '锦纶尼龙面料'),
('纯亚麻', 3, 2, 5, 1, '100%纯亚麻面料'),
('棉麻混纺', 3, 2, 4, 1, '棉麻混纺面料'),
('棉弹混纺', 4, 2, 6, 1, '棉氨弹力混纺'),
('涤弹混纺', 4, 2, 5, 1, '涤氨弹力混纺');

-- 原料锁定表
CREATE TABLE material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    lock_quantity DECIMAL(12,2) NOT NULL COMMENT '锁定数量',
    lock_status VARCHAR(20) DEFAULT 'LOCKED' COMMENT '锁定状态：LOCKED-已锁定, USED-已使用, RELEASED-已释放',
    lock_time DATETIME COMMENT '锁定时间',
    release_time DATETIME COMMENT '释放时间',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：1-删除, 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_lock_status (lock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料锁定表';

-- 初始化原料数据
INSERT INTO raw_material (name, type, specification, unit, total_quantity, warning_quantity, moisture_proof, status, description) VALUES
('精梳棉纱', 'COTTON', '40S/2', '公斤', 5000, 1000, 1, 'NORMAL', '高品质精梳棉纱'),
('普梳棉纱', 'COTTON', '32S/1', '公斤', 3000, 800, 1, 'NORMAL', '普通普梳棉纱'),
('涤纶低弹丝', 'POLYESTER', '150D/48F', '公斤', 8000, 1500, 1, 'NORMAL', '涤纶低弹丝DTY'),
('涤纶长丝', 'POLYESTER', '100D/36F', '公斤', 6000, 1200, 1, 'NORMAL', '涤纶预取向丝POY'),
('锦纶长丝', 'CHEMICAL', '70D/24F', '公斤', 4000, 800, 1, 'NORMAL', '锦纶6长丝'),
('分散染料', 'DYE', '红色', '公斤', 500, 100, 0, 'NORMAL', '高温型分散染料'),
('活性染料', 'DYE', '蓝色', '公斤', 300, 50, 0, 'NORMAL', '棉用活性染料'),
('定型树脂', 'AUXILIARY', '环保型', '公斤', 200, 40, 0, 'NORMAL', '定型用树脂助剂'),
('柔软剂', 'AUXILIARY', '亲水性', '公斤', 150, 30, 0, 'NORMAL', '面料柔软整理剂');
