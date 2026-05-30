CREATE DATABASE IF NOT EXISTS mining_maintenance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mining_maintenance;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) NOT NULL COMMENT '角色：TECHNICIAN-维保技师，DISPATCHER-调度员，MATERIAL-物资管理，ADMIN-平台管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    mining_area VARCHAR(100) COMMENT '所属矿区',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE equipment_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID，0表示顶级',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码',
    category_type VARCHAR(50) COMMENT '类目类型：EXCAVATION-挖掘设备，LOADING-装载设备，DRILLING-钻探设备，TRANSPORT-输送辅助器械',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下线，1-启用',
    mining_area VARCHAR(100) COMMENT '所属矿区',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程器械类目表';

CREATE TABLE equipment_asset (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '资产ID',
    equipment_code VARCHAR(50) NOT NULL UNIQUE COMMENT '设备唯一编码',
    factory_serial VARCHAR(100) NOT NULL COMMENT '出厂编号',
    equipment_name VARCHAR(100) NOT NULL COMMENT '设备名称',
    category_id BIGINT NOT NULL COMMENT '类目ID',
    mining_area VARCHAR(100) NOT NULL COMMENT '服役矿区',
    use_years INT COMMENT '投入使用年限',
    rated_condition VARCHAR(200) COMMENT '额定工况',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：NORMAL-正常运行，FAULT-故障停机，MAINTENANCE-进厂维保',
    last_maintenance_date DATE COMMENT '上次维保日期',
    next_maintenance_date DATE COMMENT '下次维保日期',
    maintenance_cycle_days INT DEFAULT 90 COMMENT '强制维保周期（天）',
    warning_flag TINYINT DEFAULT 0 COMMENT '预警标记：0-正常，1-待维保',
    location VARCHAR(200) COMMENT '当前位置',
    remarks VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_mining_area (mining_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在用机械资产表';

CREATE TABLE maintenance_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    equipment_id BIGINT NOT NULL COMMENT '设备ID',
    equipment_code VARCHAR(50) NOT NULL COMMENT '设备编码',
    mining_area VARCHAR(100) NOT NULL COMMENT '所属矿区',
    fault_level VARCHAR(20) NOT NULL COMMENT '故障等级：LOW-低，MEDIUM-中，HIGH-高，URGENT-紧急',
    fault_description TEXT COMMENT '故障描述',
    report_user_id BIGINT NOT NULL COMMENT '上报人ID',
    report_time DATETIME NOT NULL COMMENT '上报时间',
    assigned_technician_id BIGINT COMMENT '指派维保技师ID',
    assigned_time DATETIME COMMENT '指派时间',
    accept_time DATETIME COMMENT '接单时间',
    start_time DATETIME COMMENT '开始维修时间',
    complete_time DATETIME COMMENT '完成维修时间',
    accept_flag TINYINT DEFAULT 0 COMMENT '接单标记：0-未接单，1-已接单',
    reassign_count INT DEFAULT 0 COMMENT '重新派单次数',
    status VARCHAR(20) DEFAULT 'REPORTED' COMMENT '工单状态：REPORTED-已上报，ASSIGNED-已指派，ACCEPTED-已接单，IN_PROGRESS-维修中，COMPLETED-已完成，ACCEPTED_OK-验收通过，REOPENED-重新开单',
    maintenance_content TEXT COMMENT '维修内容',
    parts_used TEXT COMMENT '使用配件',
    labor_hours DECIMAL(5,2) COMMENT '工时',
    checker_id BIGINT COMMENT '验收人ID',
    check_time DATETIME COMMENT '验收时间',
    check_opinion VARCHAR(500) COMMENT '验收意见',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_mining_area (mining_area),
    INDEX idx_assigned_technician_id (assigned_technician_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='故障维保派工单表';

CREATE TABLE maintenance_order_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_content TEXT COMMENT '操作内容',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    from_status VARCHAR(20) COMMENT '原状态',
    to_status VARCHAR(20) COMMENT '新状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单操作日志表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物资ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    material_type VARCHAR(50) COMMENT '物资类型',
    specification VARCHAR(100) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    stock_quantity INT DEFAULT 0 COMMENT '库存数量',
    mining_area VARCHAR(100) NOT NULL COMMENT '所属矿区',
    location VARCHAR(200) COMMENT '存放位置',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    remarks VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_mining_area (mining_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维保物资表';

CREATE TABLE material_usage_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '领用单号',
    order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单编号',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物资编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物资名称',
    specification VARCHAR(100) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    quantity INT NOT NULL COMMENT '领用数量',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    mining_area VARCHAR(100) NOT NULL COMMENT '所属矿区',
    equipment_id BIGINT COMMENT '设备ID',
    equipment_code VARCHAR(50) COMMENT '设备编码',
    receiver_id BIGINT NOT NULL COMMENT '领用人ID',
    receiver_name VARCHAR(50) NOT NULL COMMENT '领用人姓名',
    receive_time DATETIME NOT NULL COMMENT '领用时间',
    usage_purpose VARCHAR(200) COMMENT '用途',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待核销，VERIFIED-已核销',
    verifier_id BIGINT COMMENT '核销人ID',
    verifier_name VARCHAR(50) COMMENT '核销人姓名',
    verify_time DATETIME COMMENT '核销时间',
    remarks VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_mining_area (mining_area),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资领用记录表';

CREATE TABLE maintenance_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报表ID',
    report_month VARCHAR(7) NOT NULL COMMENT '报表月份 yyyy-MM',
    mining_area VARCHAR(100) NOT NULL COMMENT '所属矿区',
    category_id BIGINT COMMENT '类目ID',
    total_equipment_count INT DEFAULT 0 COMMENT '设备总数',
    fault_count INT DEFAULT 0 COMMENT '故障次数',
    maintenance_count INT DEFAULT 0 COMMENT '维保次数',
    total_parts_cost DECIMAL(12,2) DEFAULT 0 COMMENT '配件总成本',
    total_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '工时总成本',
    total_maintenance_cost DECIMAL(12,2) DEFAULT 0 COMMENT '维保总开支',
    total_downtime_hours DECIMAL(10,2) DEFAULT 0 COMMENT '设备停工总时长(小时)',
    avg_repair_hours DECIMAL(10,2) DEFAULT 0 COMMENT '平均维修时长(小时)',
    completion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '工单完成率',
    status TINYINT DEFAULT 0 COMMENT '状态：0-草稿，1-已发布',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_month_area_category (report_month, mining_area, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度运维报表表';

INSERT INTO sys_user (username, password, real_name, phone, role, status, mining_area) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu', '系统管理员', '13800000000', 'ADMIN', 1, '总部'),
('dispatcher01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu', '张调度', '13800000001', 'DISPATCHER', 1, '东区矿区'),
('technician01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu', '李技师', '13800000002', 'TECHNICIAN', 1, '东区矿区'),
('technician02', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu', '王技师', '13800000003', 'TECHNICIAN', 1, '西区矿区'),
('material01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu', '赵库管', '13800000004', 'MATERIAL', 1, '东区矿区');

INSERT INTO equipment_category (parent_id, category_name, category_code, category_type, sort_order, status, mining_area) VALUES
(0, '挖掘设备', 'EXCAVATION', 'EXCAVATION', 1, 1, '总部'),
(0, '装载设备', 'LOADING', 'LOADING', 2, 1, '总部'),
(0, '钻探设备', 'DRILLING', 'DRILLING', 3, 1, '总部'),
(0, '输送辅助器械', 'TRANSPORT', 'TRANSPORT', 4, 1, '总部'),
(1, '挖掘机', 'EXCAVATOR', 'EXCAVATION', 1, 1, '总部'),
(1, '推土机', 'BULLDOZER', 'EXCAVATION', 2, 1, '总部'),
(2, '装载机', 'LOADER', 'LOADING', 1, 1, '总部'),
(2, '铲运机', 'SCRAPER', 'LOADING', 2, 1, '总部'),
(3, '钻机', 'DRILL', 'DRILLING', 1, 1, '总部'),
(4, '输送带', 'CONVEYOR', 'TRANSPORT', 1, 1, '总部');