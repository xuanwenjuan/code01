-- 创建数据库
CREATE DATABASE IF NOT EXISTS liquor_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE liquor_management;

-- ============================================
-- 用户权限模块
-- ============================================

-- 角色表
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description VARCHAR(255) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================
-- 酒水品类分类模块
-- ============================================

-- 酒水分类表
DROP TABLE IF EXISTS liquor_category;
CREATE TABLE liquor_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    tree_path VARCHAR(500) COMMENT '树路径',
    level INT DEFAULT 1 COMMENT '层级',
    description VARCHAR(255) COMMENT '分类描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0停用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒水分类表';

-- 酒水配方表
DROP TABLE IF EXISTS liquor_formula;
CREATE TABLE liquor_formula (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    formula_code VARCHAR(50) NOT NULL UNIQUE COMMENT '配方编码',
    formula_name VARCHAR(100) NOT NULL COMMENT '配方名称',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    description TEXT COMMENT '配方描述',
    brewing_process TEXT COMMENT '酿造工艺说明',
    fermentation_days INT COMMENT '发酵天数',
    aging_days INT COMMENT '陈放天数',
    alcohol_content DECIMAL(5,2) COMMENT '酒精度数',
    shelf_life INT COMMENT '保质期(月)',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0停用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒水配方表';

-- ============================================
-- 酿造物料库存模块
-- ============================================

-- 物料类型表
DROP TABLE IF EXISTS material_type;
CREATE TABLE material_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    type_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类型编码',
    type_name VARCHAR(100) NOT NULL COMMENT '类型名称',
    description VARCHAR(255) COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料类型表';

-- 物料表
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    type_id BIGINT NOT NULL COMMENT '物料类型ID',
    specification VARCHAR(255) COMMENT '规格',
    unit VARCHAR(20) NOT NULL COMMENT '单位',
    warning_stock DECIMAL(12,2) DEFAULT 0 COMMENT '预警库存',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常 2预警 3停止采购',
    is_fermented TINYINT DEFAULT 0 COMMENT '是否发酵类：0否 1是',
    shelf_life_days INT COMMENT '保质期(天)',
    description VARCHAR(255) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_type_id (type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料表';

-- 物料库存批次表
DROP TABLE IF EXISTS material_batch;
CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(12,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    produce_date DATE COMMENT '生产日期',
    expire_date DATE COMMENT '到期日期',
    supplier VARCHAR(100) COMMENT '供应商',
    warehouse_position VARCHAR(100) COMMENT '库位',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常 0作废',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_code (batch_code),
    INDEX idx_expire_date (expire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料库存批次表';

-- 物料出入库记录表
DROP TABLE IF EXISTS material_stock_record;
CREATE TABLE material_stock_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '记录编号',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    record_type TINYINT NOT NULL COMMENT '类型：1入库 2出库',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(12,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    work_order_id BIGINT COMMENT '关联工单ID',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_batch_id (batch_id),
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料出入库记录表';

-- ============================================
-- 酿造灌装生产工单模块
-- ============================================

-- 生产工单表
DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    order_name VARCHAR(100) NOT NULL COMMENT '工单名称',
    formula_id BIGINT NOT NULL COMMENT '配方ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划产量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际产量',
    unit VARCHAR(20) NOT NULL COMMENT '单位',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 0 COMMENT '状态：0已创建 10发酵中 20勾调中 30陈放中 40过滤中 50灌装中 60贴标中 70质检中 80已完成 90已冻结 99已取消',
    brewer_id BIGINT COMMENT '酿造技术员ID',
    supervisor_id BIGINT COMMENT '车间主管ID',
    inspector_id BIGINT COMMENT '巡检员ID',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划完成日期',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_formula_id (formula_id),
    INDEX idx_status (status),
    INDEX idx_brewer_id (brewer_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单用料明细表
DROP TABLE IF EXISTS work_order_material;
CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_id BIGINT COMMENT '批次ID',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    unit VARCHAR(20) NOT NULL COMMENT '单位',
    unit_price DECIMAL(12,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

-- 工单流程记录表
DROP TABLE IF EXISTS work_order_process;
CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_type TINYINT NOT NULL COMMENT '工序类型：10发酵 20勾调 30陈放 40过滤 50灌装 60贴标 70质检',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    operator_id BIGINT COMMENT '操作人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    duration INT COMMENT '耗时(分钟)',
    process_params TEXT COMMENT '工艺参数',
    process_result TEXT COMMENT '处理结果',
    status TINYINT DEFAULT 0 COMMENT '状态：0未开始 1进行中 2已完成',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_type (process_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单流程记录表';

-- ============================================
-- 酿造成本核算模块
-- ============================================

-- 成本统计表
DROP TABLE IF EXISTS cost_statistics;
CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    statistics_month VARCHAR(7) NOT NULL COMMENT '统计月份 yyyy-MM',
    work_order_count INT DEFAULT 0 COMMENT '工单数量',
    material_cost DECIMAL(15,2) DEFAULT 0 COMMENT '主料成本',
    equipment_cost DECIMAL(15,2) DEFAULT 0 COMMENT '设备运维成本',
    utility_cost DECIMAL(15,2) DEFAULT 0 COMMENT '水电能耗成本',
    labor_cost DECIMAL(15,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(15,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总成本',
    total_output DECIMAL(15,2) DEFAULT 0 COMMENT '总产量',
    unit_cost DECIMAL(15,4) DEFAULT 0 COMMENT '单位成本',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    UNIQUE KEY uk_statistics_month (statistics_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

-- 工单成本表
DROP TABLE IF EXISTS work_order_cost;
CREATE TABLE work_order_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    material_cost DECIMAL(15,2) DEFAULT 0 COMMENT '主料成本',
    equipment_cost DECIMAL(15,2) DEFAULT 0 COMMENT '设备运维成本',
    utility_cost DECIMAL(15,2) DEFAULT 0 COMMENT '水电能耗成本',
    labor_cost DECIMAL(15,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(15,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总成本',
    output_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '产量',
    unit_cost DECIMAL(15,4) DEFAULT 0 COMMENT '单位成本',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单成本表';

-- ============================================
-- 操作日志模块
-- ============================================

-- 操作日志表
DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(50) COMMENT '模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(255) COMMENT '操作描述',
    method VARCHAR(200) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：1成功 0失败',
    error_msg TEXT COMMENT '错误信息',
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化角色
INSERT INTO sys_role (role_code, role_name, description, sort_order) VALUES
('purchaser', '采购统筹', '负责物料采购和库存管理', 1),
('brewer', '酿造技术员', '负责酿造生产工艺执行', 2),
('supervisor', '车间主管', '负责车间生产管理和调度', 3),
('inspector', '成品巡检员', '负责产品质量检验', 4);

-- 初始化物料类型
INSERT INTO material_type (type_code, type_name, sort_order) VALUES
('GRAIN', '酿酒粮食', 1),
('YEAST', '酿造曲料', 2),
('BASE_WINE', '食用基酒', 3),
('FLAVORING', '调味辅料', 4),
('BOTTLE', '玻璃瓶', 5),
('PACKAGING', '外包装耗材', 6);

-- 初始化酒水分类
INSERT INTO liquor_category (category_code, category_name, parent_id, tree_path, level, sort_order) VALUES
('GRAIN_LIQUOR', '粮食白酒', 0, ',0,', 1, 1),
('FRUIT_WINE', '果味酒水', 0, ',0,', 1, 2),
('HEALTH_WINE', '养生泡酒', 0, ',0,', 1, 3),
('LOW_ALCOHOL', '低度饮品酒', 0, ',0,', 1, 4);
