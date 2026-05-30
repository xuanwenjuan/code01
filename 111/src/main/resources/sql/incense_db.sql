CREATE DATABASE IF NOT EXISTS incense_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE incense_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：MASTER-配料师傅, BUYER-原料采办, KEEPER-库房管护, ADMIN-平台总管',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用,1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '系统用户表';

CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架,1-在售',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id)
) COMMENT '灵香品类类目表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '原料类型：HERB-草本香料, WOOD-木质香粉, BINDER-黏合辅料, DYE-天然染材',
    origin VARCHAR(200) NOT NULL COMMENT '产地',
    fineness VARCHAR(50) COMMENT '研磨细度',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    warning_quantity DECIMAL(10,2) DEFAULT 10 COMMENT '预警数量',
    expire_date DATE COMMENT '过期日期',
    status VARCHAR(20) DEFAULT 'SUFFICIENT' COMMENT '状态：SUFFICIENT-库存充足, WARNING-存量告急, DISABLED-停采弃用',
    unit_price DECIMAL(10,2) COMMENT '单价',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_batch_code (batch_code),
    INDEX idx_status (status)
) COMMENT '天然香材原料表';

CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '品类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '品类名称',
    formula_detail TEXT COMMENT '香方配伍详情',
    target_quantity DECIMAL(10,2) NOT NULL COMMENT '目标产量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '状态：PENDING-待启动, MIXING-粉料混合, KNEADING-揉泥挤香, DRYING-晾晒阴干, CUTTING-裁切规整, PACKAGED-封装入库, FROZEN-已冻结, CANCELLED-已取消',
    master_id BIGINT COMMENT '配料师傅ID',
    master_name VARCHAR(50) COMMENT '配料师傅姓名',
    start_time DATETIME COMMENT '开始时间',
    finish_time DATETIME COMMENT '完成时间',
    freeze_reason VARCHAR(500) COMMENT '冻结原因',
    actual_quantity DECIMAL(10,2) COMMENT '实际产量',
    loss_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) COMMENT '古法制香生产工单表';

CREATE TABLE order_process_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    process_step VARCHAR(30) NOT NULL COMMENT '工序步骤',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark VARCHAR(500) COMMENT '备注',
    INDEX idx_order_id (order_id)
) COMMENT '工单流程日志表';

CREATE TABLE order_material_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    batch_code VARCHAR(50) NOT NULL COMMENT '批次编码',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) COMMENT '工单原料使用明细表';

CREATE TABLE material_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    ledger_type VARCHAR(20) NOT NULL COMMENT '类型：IN-入库, OUT-出库, PROCESS-加工损耗, SALE-销售',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    batch_code VARCHAR(50) NOT NULL COMMENT '批次编码',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    related_order_no VARCHAR(50) COMMENT '关联工单编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_ledger_no (ledger_no),
    INDEX idx_ledger_type (ledger_type),
    INDEX idx_material_id (material_id),
    INDEX idx_create_time (create_time)
) COMMENT '原料收支台账表';

CREATE TABLE quarterly_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报表ID',
    report_year INT NOT NULL COMMENT '年份',
    report_quarter INT NOT NULL COMMENT '季度',
    category_id BIGINT COMMENT '品类ID',
    category_name VARCHAR(100) COMMENT '品类名称',
    material_type VARCHAR(50) COMMENT '原料类型',
    total_usage DECIMAL(10,2) DEFAULT 0 COMMENT '耗用总量',
    process_cost DECIMAL(10,2) DEFAULT 0 COMMENT '加工开销',
    loss_cost DECIMAL(10,2) DEFAULT 0 COMMENT '折损成本',
    sales_revenue DECIMAL(10,2) DEFAULT 0 COMMENT '营收',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    profit DECIMAL(10,2) DEFAULT 0 COMMENT '利润',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_year_quarter_category (report_year, report_quarter, category_id)
) COMMENT '季度经营报表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(100) NOT NULL COMMENT '操作',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    duration BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败,1-成功',
    error_msg TEXT COMMENT '错误信息',
    INDEX idx_user_id (user_id),
    INDEX idx_operation_time (operation_time)
) COMMENT '操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '平台总管', '13800000000', 'ADMIN', 1),
('master01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李师傅', '13800000001', 'MASTER', 1),
('buyer01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张采办', '13800000002', 'BUYER', 1),
('keeper01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王管护', '13800000003', 'KEEPER', 1);

INSERT INTO category (parent_id, category_name, category_code, level, sort_order, status, description) VALUES
(0, '祈福檀香', 'QI_FU', 1, 1, 1, '祈福专用檀香系列'),
(0, '静心草香', 'JING_XIN', 1, 2, 1, '静心养性草香系列'),
(0, '松柏贡香', 'SONG_BAI', 1, 3, 1, '松柏贡品香系列'),
(0, '古法合香', 'GU_FA', 1, 4, 1, '传统古法合香系列'),
(1, '安神檀香', 'AN_SHEN', 2, 1, 1, '安神助眠檀香'),
(1, '招财檀香', 'ZHAO_CAI', 2, 2, 1, '招财进宝檀香'),
(2, '艾草香', 'AI_CAO', 2, 1, 1, '艾草驱蚊香'),
(2, '薰衣草香', 'XUN_YI_CAO', 2, 2, 1, '薰衣草舒缓香');
