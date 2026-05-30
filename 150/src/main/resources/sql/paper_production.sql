-- 纸质包装制品生产管控系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS paper_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE paper_production;

-- 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 系统角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(100) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    description VARCHAR(500) COMMENT '描述',
    method VARCHAR(20) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    location VARCHAR(200) COMMENT '位置',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    status TINYINT DEFAULT 1 COMMENT '状态：1成功 0失败',
    error_msg TEXT COMMENT '错误信息',
    cost_time BIGINT COMMENT '耗时(毫秒)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 产品分类表
CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT NOT NULL COMMENT '分类等级',
    category_type VARCHAR(50) NOT NULL COMMENT '分类类型：EXPRESS-快递纸箱 FOOD-食品礼盒 COLOR-彩印包装盒 LINER-定制纸质内衬',
    specification VARCHAR(200) COMMENT '规格',
    material VARCHAR(200) COMMENT '材质',
    unit_price DECIMAL(10,2) COMMENT '单价',
    priority INT DEFAULT 1 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常 0停止排产',
    sort INT DEFAULT 0 COMMENT '排序',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type),
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 物料表
CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型：KRAFT-牛皮纸 WHITE-白板纸 CORRUGATED-瓦楞原纸 INK-印刷油墨 GLUE-粘合胶水',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    stock_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '当前库存',
    min_stock DECIMAL(12,2) COMMENT '最小库存预警',
    max_stock DECIMAL(12,2) COMMENT '最大库存上限',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常库存 2库存预警 3暂停采购',
    moisture_proof TINYINT DEFAULT 0 COMMENT '是否防潮：0否 1是',
    expiry_date DATE COMMENT '有效期',
    storage_location VARCHAR(200) COMMENT '存放位置',
    supplier VARCHAR(200) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_material_code (material_code),
    INDEX idx_material_type (material_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料表';

-- 物料批次表
CREATE TABLE IF NOT EXISTS material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期',
    inbound_time DATETIME COMMENT '入库时间',
    supplier VARCHAR(200) COMMENT '供应商',
    storage_location VARCHAR(200) COMMENT '存放位置',
    status TINYINT DEFAULT 1 COMMENT '状态：1有效 0已用完',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料批次表';

-- 物料入库单表
CREATE TABLE IF NOT EXISTS material_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    batch_no VARCHAR(50) NOT NULL COMMENT '批次号',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(12,2) NOT NULL COMMENT '总价',
    supplier VARCHAR(200) COMMENT '供应商',
    inbound_time DATETIME COMMENT '入库时间',
    storage_location VARCHAR(200) COMMENT '存放位置',
    operator VARCHAR(50) COMMENT '操作人',
    status TINYINT DEFAULT 1 COMMENT '状态：1已入库 0作废',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_inbound_no (inbound_no),
    INDEX idx_material_id (material_id),
    INDEX idx_inbound_time (inbound_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料入库单表';

-- 物料出库单表
CREATE TABLE IF NOT EXISTS material_outbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    outbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    batch_no VARCHAR(50) NOT NULL COMMENT '批次号',
    quantity DECIMAL(12,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(12,2) NOT NULL COMMENT '总价',
    work_order_no VARCHAR(50) COMMENT '关联工单号',
    receiver VARCHAR(50) COMMENT '领用人',
    outbound_time DATETIME COMMENT '出库时间',
    operator VARCHAR(50) COMMENT '操作人',
    status TINYINT DEFAULT 1 COMMENT '状态：1已出库 0作废',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_outbound_no (outbound_no),
    INDEX idx_material_id (material_id),
    INDEX idx_work_order_no (work_order_no),
    INDEX idx_outbound_time (outbound_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料出库单表';

-- 生产工单表
CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    order_name VARCHAR(200) NOT NULL COMMENT '工单名称',
    product_category_id BIGINT NOT NULL COMMENT '产品分类ID',
    product_category_name VARCHAR(100) NOT NULL COMMENT '产品分类名称',
    specification VARCHAR(200) COMMENT '规格',
    quantity DECIMAL(12,2) NOT NULL COMMENT '生产数量',
    finished_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '完成数量',
    defective_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '不良数量',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1待排产 2已排产 3裁切分条 4瓦楞裱合 5模切成型 6彩色印刷 7粘合折叠 8外观质检 9成品打包 10已完成 11已搁置 12已取消',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    production_line VARCHAR(100) COMMENT '生产线',
    operator VARCHAR(50) COMMENT '操作人',
    supervisor VARCHAR(50) COMMENT '负责人',
    priority INT DEFAULT 1 COMMENT '优先级',
    customer VARCHAR(200) COMMENT '客户',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_product_category_id (product_category_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单工序记录表
CREATE TABLE IF NOT EXISTS work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    process_type INT NOT NULL COMMENT '工序类型：2已排产 3裁切分条 4瓦楞裱合 5模切成型 6彩色印刷 7粘合折叠 8外观质检 9成品打包',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    input_quantity DECIMAL(12,2) COMMENT '投入数量',
    output_quantity DECIMAL(12,2) COMMENT '产出数量',
    defective_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '不良数量',
    equipment VARCHAR(100) COMMENT '设备',
    operator VARCHAR(50) COMMENT '操作人',
    status TINYINT DEFAULT 1 COMMENT '状态：1进行中 2已完成',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_type (process_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序记录表';

-- 工单用料表
CREATE TABLE IF NOT EXISTS work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    plan_quantity DECIMAL(12,2) NOT NULL COMMENT '计划用量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(12,2) NOT NULL COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

-- 生产成本表
CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    order_name VARCHAR(200) NOT NULL COMMENT '工单名称',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原材料成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备损耗',
    utility_cost DECIMAL(12,2) DEFAULT 0 COMMENT '水电能耗',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '残料报废',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    output_quantity DECIMAL(12,2) COMMENT '产出数量',
    unit_cost DECIMAL(12,4) COMMENT '单位成本',
    cost_date DATE COMMENT '核算日期',
    period VARCHAR(20) COMMENT '会计期间',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常 0作废',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_order_no (order_no),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- 成本明细表
CREATE TABLE IF NOT EXISTS cost_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cost_id BIGINT NOT NULL COMMENT '成本ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    cost_type VARCHAR(50) NOT NULL COMMENT '成本类型：MATERIAL-原材料 EQUIPMENT-设备 UTILITY-水电 LABOR-人工 SCRAP-报废',
    cost_name VARCHAR(100) NOT NULL COMMENT '成本名称',
    material_id BIGINT COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(12,2) COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    unit VARCHAR(20) COMMENT '计量单位',
    specification VARCHAR(200) COMMENT '规格',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_cost_id (cost_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_cost_type (cost_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本明细表';

-- 月度报表表
CREATE TABLE IF NOT EXISTS monthly_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_month VARCHAR(20) NOT NULL UNIQUE COMMENT '报表月份',
    total_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总原材料成本',
    total_equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总设备损耗',
    total_utility_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总水电能耗',
    total_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总人工工时',
    total_scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总残料报废',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    total_output_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '总产出数量',
    finished_order_count INT DEFAULT 0 COMMENT '完成工单数量',
    total_order_count INT DEFAULT 0 COMMENT '总工单数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_report_month (report_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度报表表';

-- 初始化角色数据
INSERT INTO sys_role (role_code, role_name, description) VALUES
('ADMIN', '系统管理员', '系统最高权限管理员'),
('PURCHASE', '采购员', '负责原材料采购和库存管理'),
('PROCESS', '工艺设计师', '负责产品工艺设计和BOM制定'),
('PRODUCTION', '产线管理员', '负责生产工单管理和进度跟踪'),
('QUALITY', '质量巡检员', '负责产品质量检验和巡检');

-- 初始化管理员用户 (密码: admin123)
INSERT INTO sys_user (username, password, nickname, role, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'ADMIN', 1);

-- 库存锁定表
CREATE TABLE IF NOT EXISTS material_stock_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lock_no VARCHAR(50) NOT NULL UNIQUE COMMENT '锁定单号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格',
    lock_quantity DECIMAL(12,2) NOT NULL COMMENT '锁定数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    batch_no VARCHAR(50) COMMENT '批次号',
    status TINYINT DEFAULT 1 COMMENT '状态：1锁定 0已释放',
    lock_time DATETIME COMMENT '锁定时间',
    release_time DATETIME COMMENT '释放时间',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_lock_no (lock_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存锁定表';

-- 次品处理表
CREATE TABLE IF NOT EXISTS defective_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    defective_no VARCHAR(50) NOT NULL UNIQUE COMMENT '次品单号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    product_category_id BIGINT COMMENT '产品分类ID',
    product_category_name VARCHAR(100) COMMENT '产品分类名称',
    process_id BIGINT NOT NULL COMMENT '工序ID',
    process_name VARCHAR(100) COMMENT '工序名称',
    process_type VARCHAR(50) COMMENT '工序类型',
    defective_quantity DECIMAL(12,2) NOT NULL COMMENT '次品数量',
    total_quantity DECIMAL(12,2) NOT NULL COMMENT '总数量',
    defective_rate DECIMAL(5,2) COMMENT '不良率(%)',
    defective_type VARCHAR(50) COMMENT '次品类型',
    defective_reason VARCHAR(500) COMMENT '次品原因',
    handle_method VARCHAR(100) COMMENT '处理方式',
    handle_cost DECIMAL(12,2) DEFAULT 0 COMMENT '处理费用',
    scrap_value DECIMAL(12,2) DEFAULT 0 COMMENT '残值',
    loss_amount DECIMAL(12,2) DEFAULT 0 COMMENT '损失金额',
    inspector VARCHAR(50) COMMENT '检验员',
    operator VARCHAR(50) COMMENT '操作员',
    status TINYINT DEFAULT 1 COMMENT '状态：1待处理 2已处理',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_defective_no (defective_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_id (process_id),
    INDEX idx_defective_type (defective_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='次品处理表';

-- 为work_order_material表添加batch_no字段
ALTER TABLE work_order_material ADD COLUMN IF NOT EXISTS batch_no VARCHAR(50) COMMENT '批次号' AFTER unit_price;
