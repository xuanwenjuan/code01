CREATE DATABASE IF NOT EXISTS rotor_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rotor_db;

-- 用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) COMMENT '角色：ADMIN-管理员，PURCHASE-采购专员，PRODUCTION-生产工艺员，GROUP_LEADER-产线组长，QUALITY-质检员，FINANCE-财务',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 产品分类表
DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '排产优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停产下线，1-正常',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 原料仓储表
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    material_type VARCHAR(50) COMMENT '原料类型：SILICON_STEEL-硅钢片，PERMANENT_MAGNET-永磁体，SHAFT_BLANK-转轴坯料，INSULATION_COATING-绝缘涂层辅料',
    batch_no VARCHAR(100) COMMENT '批次号',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '总库存数量',
    locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已锁定数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    stock_status TINYINT DEFAULT 0 COMMENT '库存状态：0-库存充足，1-库存预警，2-停止采购',
    production_date DATETIME COMMENT '生产日期',
    expiry_date DATETIME COMMENT '有效期',
    storage_condition VARCHAR(200) COMMENT '存储条件',
    supplier VARCHAR(100) COMMENT '供应商',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料仓储表';

-- 生产工单表
DROP TABLE IF EXISTS production_order;
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    quantity INT COMMENT '生产数量',
    status TINYINT DEFAULT 0 COMMENT '工单状态：0-待投产，1-生产中，2-已完成，3-已暂停',
    process_id BIGINT COMMENT '当前工序ID',
    process_name VARCHAR(100) COMMENT '当前工序名称',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    group_leader_id BIGINT COMMENT '组长ID',
    group_leader_name VARCHAR(50) COMMENT '组长姓名',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单工序表
DROP TABLE IF EXISTS order_process;
CREATE TABLE order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_type INT COMMENT '工序类型：1-硅钢片叠压成型，2-转轴压装，3-绕组嵌线，4-动平衡校正，5-绝缘检测，6-表面喷涂，7-成品入库',
    process_name VARCHAR(100) COMMENT '工序名称',
    sort INT COMMENT '工序顺序',
    status TINYINT DEFAULT 0 COMMENT '工序状态：0-待执行，1-进行中，2-已完成',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良数量',
    energy_consumption DECIMAL(10,2) COMMENT '能耗(度)',
    labor_hours DECIMAL(10,2) COMMENT '工时(小时)',
    equipment_cost DECIMAL(10,2) COMMENT '设备成本',
    scrap_material_cost DECIMAL(10,2) COMMENT '物料报废成本',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

-- 成本核算表
DROP TABLE IF EXISTS cost_accounting;
CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    product_id BIGINT COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    quantity INT COMMENT '生产数量',
    silicon_steel_cost DECIMAL(12,2) COMMENT '硅钢片成本',
    magnet_cost DECIMAL(12,2) COMMENT '永磁体成本',
    shaft_cost DECIMAL(12,2) COMMENT '转轴成本',
    coating_cost DECIMAL(12,2) COMMENT '绝缘涂层成本',
    other_material_cost DECIMAL(12,2) COMMENT '其他材料成本',
    equipment_cost DECIMAL(12,2) COMMENT '设备成本',
    labor_cost DECIMAL(12,2) COMMENT '人工成本',
    energy_cost DECIMAL(12,2) COMMENT '能耗成本',
    scrap_cost DECIMAL(12,2) COMMENT '报废成本',
    other_cost DECIMAL(12,2) COMMENT '其他成本',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    unit_cost DECIMAL(10,2) COMMENT '单位成本',
    accounting_date DATETIME COMMENT '核算日期',
    accountant VARCHAR(50) COMMENT '核算人',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';

-- 工单用料明细表
DROP TABLE IF EXISTS order_material;
CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料编码',
    material_type VARCHAR(50) COMMENT '原料类型',
    batch_no VARCHAR(100) COMMENT '批次号',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    operation_type TINYINT COMMENT '操作类型：1-领料，2-退料，3-报废，4-补充',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_time DATETIME COMMENT '操作时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

-- 操作日志表
DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作类型',
    method VARCHAR(200) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    time BIGINT COMMENT '耗时(ms)',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 创建索引
CREATE INDEX idx_order_id ON order_process(order_id);
CREATE INDEX idx_order_material ON order_material(order_id);
CREATE INDEX idx_material_id ON order_material(material_id);
CREATE INDEX idx_order_id_cost ON cost_accounting(order_id);
CREATE INDEX idx_user_id_log ON operation_log(user_id);
CREATE INDEX idx_create_time_log ON operation_log(create_time);
CREATE INDEX idx_status_order ON production_order(status);
CREATE INDEX idx_status_material ON material(stock_status);
CREATE INDEX idx_status_category ON product_category(status);