CREATE DATABASE IF NOT EXISTS cosmetics_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cosmetics_db;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role TINYINT NOT NULL COMMENT '角色：1-原料采购 2-配方研发 3-生产组长 4-品控员 5-仓储管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level TINYINT DEFAULT 1 COMMENT '分类层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    description VARCHAR(255) COMMENT '分类描述',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

DROP TABLE IF EXISTS product;
CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    product_code VARCHAR(50) NOT NULL UNIQUE COMMENT '产品编码',
    name VARCHAR(100) NOT NULL COMMENT '产品名称',
    spec VARCHAR(100) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    formula_id BIGINT COMMENT '配方ID',
    sales_priority INT DEFAULT 0 COMMENT '销售优先级，数字越大优先级越高',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架停产 1-正常生产',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category_id (category_id),
    INDEX idx_product_code (product_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '原料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    name VARCHAR(100) NOT NULL COMMENT '原料名称',
    type TINYINT NOT NULL COMMENT '类型：1-植物萃取 2-表面活性剂 3-香精色素 4-包装瓶盒耗材',
    spec VARCHAR(100) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    warning_stock DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常库存 2-库存预警 3-暂停采购',
    shelf_life INT COMMENT '保质期（天）',
    is_liquid TINYINT DEFAULT 0 COMMENT '是否液态：0-否 1-是',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_material_code (material_code),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

DROP TABLE IF EXISTS material_batch;
CREATE TABLE material_batch (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '批次ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    remaining_quantity DECIMAL(10,2) NOT NULL COMMENT '剩余数量',
    locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已锁定数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    supplier VARCHAR(100) COMMENT '供应商',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '到期日期',
    is_expired TINYINT DEFAULT 0 COMMENT '是否过期：0-否 1-是',
    warehouse_time DATETIME COMMENT '入库时间',
    operator_id BIGINT COMMENT '操作人ID',
    remark VARCHAR(255) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_id (material_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料批次表';

DROP TABLE IF EXISTS formula;
CREATE TABLE formula (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配方ID',
    formula_code VARCHAR(50) NOT NULL UNIQUE COMMENT '配方编码',
    name VARCHAR(100) NOT NULL COMMENT '配方名称',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    version VARCHAR(20) COMMENT '版本号',
    output_quantity DECIMAL(10,2) COMMENT '产出量',
    output_unit VARCHAR(20) COMMENT '产出单位',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    description TEXT COMMENT '配方描述',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_formula_code (formula_code),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配方表';

DROP TABLE IF EXISTS formula_detail;
CREATE TABLE formula_detail (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    formula_id BIGINT NOT NULL COMMENT '配方ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    dosage DECIMAL(10,4) NOT NULL COMMENT '用量',
    dosage_unit VARCHAR(20) COMMENT '用量单位',
    sort_order INT DEFAULT 0 COMMENT '排序',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_formula_id (formula_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配方明细表';

DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    formula_id BIGINT NOT NULL COMMENT '配方ID',
    plan_quantity DECIMAL(10,2) NOT NULL COMMENT '计划产量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际产量',
    unit VARCHAR(20) COMMENT '单位',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待投产 2-原料称量 3-混合搅拌 4-恒温乳化 5-除菌过滤 6-灌装分装 7-贴标塑封 8-待质检 9-质检合格 10-成品入库 11-已完成 0-已暂停 -1-已取消',
    priority TINYINT DEFAULT 3 COMMENT '优先级：1-高 2-中 3-低',
    leader_id BIGINT COMMENT '生产组长ID',
    qc_id BIGINT COMMENT '品控员ID',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    auto_suspend TINYINT DEFAULT 0 COMMENT '是否自动暂停：0-否 1-是',
    is_formula_confirmed TINYINT DEFAULT 0 COMMENT '配方是否确认：0-否 1-是',
    remark VARCHAR(255) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_no (order_no),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_plan_start_date (plan_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

DROP TABLE IF EXISTS work_order_material;
CREATE TABLE work_order_material (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_batch_id BIGINT COMMENT '原料批次ID',
    plan_quantity DECIMAL(10,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    unit VARCHAR(20) COMMENT '单位',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

DROP TABLE IF EXISTS work_process;
CREATE TABLE work_process (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工序记录ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_type TINYINT NOT NULL COMMENT '工序类型：1-原料称量 2-混合搅拌 3-恒温乳化 4-除菌过滤 5-灌装分装 6-贴标塑封',
    operator_id BIGINT COMMENT '操作人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-进行中 2-已完成',
    equipment VARCHAR(100) COMMENT '使用设备',
    parameters TEXT COMMENT '工艺参数（JSON）',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_type (process_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工序记录表';

DROP TABLE IF EXISTS quality_inspection;
CREATE TABLE quality_inspection (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '质检ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    inspector_id BIGINT COMMENT '检验员ID',
    sample_quantity DECIMAL(10,2) COMMENT '抽检数量',
    qualified_quantity DECIMAL(10,2) COMMENT '合格数量',
    unqualified_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '不合格数量',
    inspection_items TEXT COMMENT '检验项目（JSON）',
    inspection_result TINYINT COMMENT '检验结果：1-合格 2-不合格 3-待复检',
    inspection_time DATETIME COMMENT '检验时间',
    report_url VARCHAR(255) COMMENT '质检报告地址',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_inspection_result (inspection_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验表';

DROP TABLE IF EXISTS finished_product;
CREATE TABLE finished_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    work_order_id BIGINT COMMENT '工单ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    remaining_quantity DECIMAL(10,2) NOT NULL COMMENT '剩余数量',
    unit VARCHAR(20) COMMENT '单位',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '到期日期',
    warehouse_time DATETIME COMMENT '入库时间',
    operator_id BIGINT COMMENT '操作人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在库 2-已出库',
    remark VARCHAR(255) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品库存表';

DROP TABLE IF EXISTS cost_statistics;
CREATE TABLE cost_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    packaging_cost DECIMAL(12,2) DEFAULT 0 COMMENT '包装物料成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位成本',
    statistics_time DATETIME COMMENT '统计时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(10) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    cost_time BIGINT COMMENT '耗时（毫秒）',
    status TINYINT DEFAULT 1 COMMENT '状态：1-成功 0-失败',
    error_msg VARCHAR(500) COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

DROP TABLE IF EXISTS material_in_out_log;
CREATE TABLE material_in_out_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_batch_id BIGINT COMMENT '原料批次ID',
    type TINYINT NOT NULL COMMENT '类型：1-入库 2-出库',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    before_quantity DECIMAL(10,2) COMMENT '操作前数量',
    after_quantity DECIMAL(10,2) COMMENT '操作后数量',
    work_order_id BIGINT COMMENT '关联工单ID',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_material_id (material_id),
    INDEX idx_type (type),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料出入库日志表';

DROP TABLE IF EXISTS finished_in_out_log;
CREATE TABLE finished_in_out_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    finished_product_id BIGINT NOT NULL COMMENT '成品库存ID',
    type TINYINT NOT NULL COMMENT '类型：1-入库 2-出库',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    before_quantity DECIMAL(10,2) COMMENT '操作前数量',
    after_quantity DECIMAL(10,2) COMMENT '操作后数量',
    order_no VARCHAR(50) COMMENT '关联订单号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_finished_product_id (finished_product_id),
    INDEX idx_type (type),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品出入库日志表';
