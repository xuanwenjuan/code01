CREATE DATABASE IF NOT EXISTS heritage_dye DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE heritage_dye;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    role VARCHAR(50) COMMENT '角色：admin-管理员 master-炼料师 purchaser-采购 warehouse-库房 operator-运营',
    status INT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE IF NOT EXISTS dye_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    category_level INT NOT NULL COMMENT '类目层级',
    category_type INT NOT NULL COMMENT '1-植物染料 2-矿物染料 3-动物原料染料 4-复合古法染料',
    formula TEXT COMMENT '配方说明',
    description TEXT COMMENT '类目描述',
    sort_order DECIMAL(10,2) DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态：1-启用 0-下架',
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type),
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='染料类目表';

CREATE TABLE IF NOT EXISTS material_origin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    origin_code VARCHAR(50) NOT NULL UNIQUE,
    origin_name VARCHAR(100) NOT NULL,
    region VARCHAR(200) COMMENT '产地地域',
    harvest_season VARCHAR(100) COMMENT '采收时节',
    extract_content DECIMAL(10,2) COMMENT '提炼含量(%)',
    annual_output DECIMAL(10,2) COMMENT '年产量(kg)',
    current_stock DECIMAL(10,2) COMMENT '当前库存(kg)',
    locked_stock DECIMAL(10,2) DEFAULT 0 COMMENT '锁定库存(kg)',
    warning_threshold DECIMAL(10,2) COMMENT '预警阈值(kg)',
    status INT DEFAULT 1 COMMENT '状态：1-正常管控 0-限制采收',
    remark TEXT,
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_origin_code (origin_code),
    INDEX idx_status (status),
    INDEX idx_harvest_season (harvest_season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料产地档案表';

CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    dye_category_id BIGINT NOT NULL,
    dye_category_name VARCHAR(100),
    material_origin_id BIGINT NOT NULL,
    material_origin_name VARCHAR(100),
    material_quantity DECIMAL(10,2) COMMENT '原料数量(kg)',
    expected_output_rate DECIMAL(10,2) COMMENT '预期产出率(%)',
    actual_output DECIMAL(10,2) COMMENT '实际产出(kg)',
    total_loss DECIMAL(10,2) DEFAULT 0 COMMENT '总损耗(kg)',
    soak_loss DECIMAL(10,2) DEFAULT 0 COMMENT '浸泡损耗(kg)',
    boil_loss DECIMAL(10,2) DEFAULT 0 COMMENT '熬煮损耗(kg)',
    filter_loss DECIMAL(10,2) DEFAULT 0 COMMENT '过滤损耗(kg)',
    concentrate_loss DECIMAL(10,2) DEFAULT 0 COMMENT '浓缩损耗(kg)',
    package_loss DECIMAL(10,2) DEFAULT 0 COMMENT '分装损耗(kg)',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本(元/kg)',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本(元)',
    status INT DEFAULT 1 COMMENT '1-待生产 2-生产中 3-已完成 9-已冻结',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    master_id BIGINT COMMENT '炼料师ID',
    master_name VARCHAR(50) COMMENT '炼料师姓名',
    warehouse_manager_id BIGINT COMMENT '库房管理员ID',
    warehouse_manager_name VARCHAR(50) COMMENT '库房管理员姓名',
    remark TEXT,
    current_step INT DEFAULT 0 COMMENT '当前工序 0-未开始 1-浸泡 2-熬煮 3-过滤 4-浓缩 5-分装',
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_dye_category_id (dye_category_id),
    INDEX idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE IF NOT EXISTS order_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_no VARCHAR(50),
    step_no INT NOT NULL COMMENT '工序序号',
    step_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    description TEXT COMMENT '工序说明',
    operator VARCHAR(50) COMMENT '操作人',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    status INT DEFAULT 0 COMMENT '0-未开始 1-进行中 2-已完成',
    step_loss DECIMAL(10,2) DEFAULT 0 COMMENT '工序损耗(kg)',
    remark TEXT,
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_step_no (step_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

CREATE TABLE IF NOT EXISTS supply_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ledger_no VARCHAR(50) NOT NULL UNIQUE,
    dye_category_id BIGINT NOT NULL,
    dye_category_name VARCHAR(100),
    material_origin_id BIGINT NOT NULL,
    material_origin_name VARCHAR(100),
    statistics_date DATE NOT NULL COMMENT '统计日期',
    material_consumption DECIMAL(10,2) DEFAULT 0 COMMENT '原料消耗量(kg)',
    product_output DECIMAL(10,2) DEFAULT 0 COMMENT '成品产出(kg)',
    total_loss DECIMAL(10,2) DEFAULT 0 COMMENT '总损耗(kg)',
    soak_loss DECIMAL(10,2) DEFAULT 0 COMMENT '浸泡损耗',
    boil_loss DECIMAL(10,2) DEFAULT 0 COMMENT '熬煮损耗',
    filter_loss DECIMAL(10,2) DEFAULT 0 COMMENT '过滤损耗',
    concentrate_loss DECIMAL(10,2) DEFAULT 0 COMMENT '浓缩损耗',
    package_loss DECIMAL(10,2) DEFAULT 0 COMMENT '分装损耗',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(10,2) DEFAULT 0 COMMENT '对外营收(元)',
    remark TEXT,
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ledger_no (ledger_no),
    INDEX idx_statistics_date (statistics_date),
    INDEX idx_dye_category_id (dye_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供需台账表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    status INT DEFAULT 1 COMMENT '1-成功 0-失败',
    error_msg TEXT COMMENT '错误信息',
    duration BIGINT COMMENT '耗时(ms)',
    deleted INT DEFAULT 0,
    version INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '123456', '系统管理员', '13800000001', 'admin', 1),
('master01', '123456', '张炼师', '13800000002', 'master', 1),
('purchaser01', '123456', '李采购', '13800000003', 'purchaser', 1),
('warehouse01', '123456', '王库管', '13800000004', 'warehouse', 1),
('operator01', '123456', '赵运营', '13800000005', 'operator', 1);

INSERT INTO dye_category (category_code, category_name, parent_id, category_level, category_type, sort_order, status) VALUES
('PLANT', '植物染料', 0, 1, 1, 1.00, 1),
('MINERAL', '矿物染料', 0, 1, 2, 2.00, 1),
('ANIMAL', '动物原料染料', 0, 1, 3, 3.00, 1),
('COMPOUND', '复合古法染料', 0, 1, 4, 4.00, 1),
('INDIGO', '靛蓝', 1, 2, 1, 1.10, 1),
('MADDER', '茜草红', 1, 2, 1, 1.20, 1),
('WELD', '黄木犀草', 1, 2, 1, 1.30, 1),
('OCHRE', '赭石', 2, 2, 2, 2.10, 1),
('AZURITE', '石青', 2, 2, 2, 2.20, 1),
('COCHINEAL', '胭脂虫红', 3, 2, 3, 3.10, 1),
('TYRIAN_PURPLE', '泰尔紫', 3, 2, 3, 3.20, 1),
('FORBIDDEN_CITY_RED', '故宫红', 4, 2, 4, 4.10, 1),
('CELESTE_BLUE', '天青蓝', 4, 2, 4, 4.20, 1);

INSERT INTO material_origin (origin_code, origin_name, region, harvest_season, extract_content, annual_output, current_stock, locked_stock, warning_threshold, status) VALUES
('INDIGO_YUNNAN', '云南靛蓝种植基地', '云南大理', '夏季6-8月', 15.50, 5000.00, 1200.00, 0.00, 200.00, 1),
('MADDER_SHAANXI', '陕西茜草种植基地', '陕西汉中', '秋季9-10月', 12.00, 3000.00, 150.00, 0.00, 100.00, 1),
('OCHRE_SHANXI', '山西赭石矿', '山西大同', '全年', 95.00, 10000.00, 5000.00, 0.00, 500.00, 1),
('AZURITE_GUIZHOU', '贵州石青矿', '贵州黔东南', '全年', 88.50, 5000.00, 80.00, 0.00, 100.00, 0),
('COCHINEAL_YUNNAN', '云南胭脂虫养殖基地', '云南西双版纳', '冬季12-2月', 25.00, 500.00, 30.00, 0.00, 50.00, 1);
