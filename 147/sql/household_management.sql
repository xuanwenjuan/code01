-- 创建数据库
CREATE DATABASE IF NOT EXISTS household_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE household_management;

-- ============================================
-- 系统权限模块
-- ============================================

-- 用户表
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '用户表';

-- 角色表
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '角色表';

-- 用户角色关联表
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '用户角色关联表';

-- 菜单表
CREATE TABLE sys_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    menu_name VARCHAR(50) NOT NULL COMMENT '菜单名称',
    menu_type TINYINT DEFAULT 1 COMMENT '菜单类型：1-目录 2-菜单 3-按钮',
    path VARCHAR(255) COMMENT '路由路径',
    component VARCHAR(255) COMMENT '组件路径',
    perms VARCHAR(100) COMMENT '权限标识',
    icon VARCHAR(50) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '菜单表';

-- 角色菜单关联表
CREATE TABLE sys_role_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '角色菜单关联表';

-- 操作日志表
CREATE TABLE sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作',
    method VARCHAR(255) COMMENT '方法',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    operator VARCHAR(50) COMMENT '操作人',
    ip VARCHAR(50) COMMENT 'IP地址',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-成功 0-失败',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '操作日志表';

-- ============================================
-- 产品分类模块
-- ============================================

-- 产品分类表
CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    icon VARCHAR(255) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '产品分类表';

-- 产品表
CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL COMMENT '分类ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    product_code VARCHAR(50) UNIQUE COMMENT '产品编码',
    specification VARCHAR(255) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    selling_price DECIMAL(10,2) COMMENT '销售价格',
    cost_price DECIMAL(10,2) COMMENT '成本价格',
    image VARCHAR(255) COMMENT '产品图片',
    description TEXT COMMENT '产品描述',
    priority INT DEFAULT 0 COMMENT '销售优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在售 0-下架停产',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '产品表';

-- ============================================
-- 原材料仓储模块
-- ============================================

-- 原材料表
CREATE TABLE raw_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) UNIQUE COMMENT '原料编码',
    material_type VARCHAR(50) COMMENT '原料类型：塑料颗粒、纯棉布料、纸质原料、日化助剂、外包装纸箱',
    specification VARCHAR(255) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    warn_stock DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    is_moisture_sensitive TINYINT DEFAULT 0 COMMENT '是否易潮：0-否 1-是',
    moisture_warning_days INT DEFAULT 30 COMMENT '防潮提醒天数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-库存充足 2-库存预警 3-暂停采购',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '原材料表';

-- 原料库存表
CREATE TABLE raw_material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '生产批次号',
    quantity DECIMAL(10,2) NOT NULL COMMENT '库存数量',
    unit_price DECIMAL(10,2) COMMENT '入库单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    production_date DATE COMMENT '生产日期',
    expiration_date DATE COMMENT '到期日期',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-已用完',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '原料库存表';

-- 原料入库单
CREATE TABLE raw_material_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inbound_no VARCHAR(50) UNIQUE NOT NULL COMMENT '入库单号',
    material_id BIGINT NOT NULL,
    supplier_name VARCHAR(100) COMMENT '供应商',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    batch_no VARCHAR(50) COMMENT '批次号',
    production_date DATE COMMENT '生产日期',
    expiration_date DATE COMMENT '到期日期',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待审核 2-已入库 3-已驳回',
    auditor_id BIGINT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '原料入库单';

-- ============================================
-- 生产工单模块
-- ============================================

-- 生产工单表
CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL COMMENT '生产数量',
    priority INT DEFAULT 0 COMMENT '优先级',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划完成日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    current_process VARCHAR(50) DEFAULT 'PREPARE' COMMENT '当前工序：PREPARE-备料 INJECTION-注塑 CUTTING-裁剪 ASSEMBLY-组装 QC-质检 PACKAGE-打包 FINISHED-完成',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待排产 2-生产中 3-已暂停 4-已完成 5-已取消',
    is_auto_paused TINYINT DEFAULT 0 COMMENT '是否超时自动暂停：0-否 1-是',
    operator_id BIGINT COMMENT '负责人ID',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '生产工单表';

-- 工单工序记录表
CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    operator_id BIGINT COMMENT '操作人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    quantity INT COMMENT '加工数量',
    qualified_quantity INT COMMENT '合格数量',
    defective_quantity INT COMMENT '次品数量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-进行中 2-已完成',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '工单工序记录表';

-- 工单用料明细表
CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_no VARCHAR(50) COMMENT '批次号',
    required_quantity DECIMAL(10,2) COMMENT '需求数量',
    actual_quantity DECIMAL(10,2) COMMENT '实际领用数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待领料 2-已领料',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '工单用料明细表';

-- 成品入库单
CREATE TABLE finished_product_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inbound_no VARCHAR(50) UNIQUE NOT NULL COMMENT '入库单号',
    work_order_id BIGINT COMMENT '关联工单ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL COMMENT '入库数量',
    qualified_quantity INT COMMENT '合格数量',
    defective_quantity INT COMMENT '次品数量',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待审核 2-已入库 3-已驳回',
    auditor_id BIGINT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '成品入库单';

-- 成品库存表
CREATE TABLE finished_product_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    warn_stock INT DEFAULT 0 COMMENT '预警库存',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 2-库存预警',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '成品库存表';

-- ============================================
-- 销售订单模块
-- ============================================

-- 客户表
CREATE TABLE customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL COMMENT '客户名称',
    customer_code VARCHAR(50) UNIQUE COMMENT '客户编码',
    contact_person VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    level TINYINT DEFAULT 1 COMMENT '客户等级',
    status TINYINT DEFAULT 1 COMMENT '状态',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '客户表';

-- 销售订单表
CREATE TABLE sales_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '订单总金额',
    priority INT DEFAULT 0 COMMENT '订单优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待确认 2-生产中 3-待发货 4-已发货 5-已完成 6-已取消',
    delivery_date DATE COMMENT '交货日期',
    delivery_address VARCHAR(255) COMMENT '送货地址',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '销售订单表';

-- 销售订单明细表
CREATE TABLE sales_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '销售订单明细表';

-- 销售出库单
CREATE TABLE sales_outbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    outbound_no VARCHAR(50) UNIQUE NOT NULL COMMENT '出库单号',
    order_id BIGINT COMMENT '关联订单ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待审核 2-已出库 3-已驳回',
    auditor_id BIGINT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    delivery_person VARCHAR(50) COMMENT '送货人',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '销售出库单';

-- 销售出库明细表
CREATE TABLE sales_outbound_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    outbound_id BIGINT NOT NULL COMMENT '出库单ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL COMMENT '出库数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    warehouse_location VARCHAR(100) COMMENT '出库库位',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '销售出库明细表';

-- ============================================
-- 品质巡检模块
-- ============================================

-- 品质巡检表
CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inspection_no VARCHAR(50) UNIQUE NOT NULL COMMENT '巡检单号',
    work_order_id BIGINT COMMENT '关联工单ID',
    product_id BIGINT COMMENT '产品ID',
    material_id BIGINT COMMENT '原料ID',
    inspection_type VARCHAR(50) COMMENT '巡检类型：原料抽检、制程巡检、成品抽检',
    inspector_id BIGINT COMMENT '巡检人ID',
    inspection_time DATETIME COMMENT '巡检时间',
    inspection_result TINYINT DEFAULT 1 COMMENT '巡检结果：1-合格 2-不合格',
    inspection_items TEXT COMMENT '巡检项目',
    defective_description TEXT COMMENT '不合格描述',
    handling_suggestion TEXT COMMENT '处理建议',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待处理 2-已处理',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '品质巡检表';

-- ============================================
-- 成本利润模块
-- ============================================

-- 成本统计表
CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    statistics_month VARCHAR(7) NOT NULL COMMENT '统计月份：yyyy-MM',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原材料成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备损耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    packaging_cost DECIMAL(12,2) DEFAULT 0 COMMENT '包装物料成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '次品报废成本',
    other_cost DECIMAL(12,2) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '销售收入',
    gross_profit DECIMAL(12,2) DEFAULT 0 COMMENT '毛利润',
    gross_margin DECIMAL(5,2) DEFAULT 0 COMMENT '毛利率(%)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '成本统计表';

-- 成本明细记录表
CREATE TABLE cost_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    statistics_month VARCHAR(7) NOT NULL COMMENT '统计月份',
    cost_type VARCHAR(50) NOT NULL COMMENT '成本类型',
    cost_amount DECIMAL(12,2) NOT NULL COMMENT '成本金额',
    work_order_id BIGINT COMMENT '关联工单ID',
    related_no VARCHAR(50) COMMENT '关联单号',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT '成本明细记录表';

-- 月度产销报表
CREATE TABLE monthly_production_sales_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_month VARCHAR(7) NOT NULL UNIQUE COMMENT '报表月份',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    sales_quantity INT DEFAULT 0 COMMENT '销售数量',
    production_value DECIMAL(12,2) DEFAULT 0 COMMENT '产值',
    sales_value DECIMAL(12,2) DEFAULT 0 COMMENT '销售额',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    net_profit DECIMAL(12,2) DEFAULT 0 COMMENT '净利润',
    profit_margin DECIMAL(5,2) DEFAULT 0 COMMENT '利润率(%)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-草稿 2-已确认',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '月度产销报表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化用户 (密码: 123456)
INSERT INTO sys_user (username, password, real_name, phone, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 1),
('purchase', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '采购员', '13800138001', 1),
('production', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '生产主管', '13800138002', 1),
('warehouse', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '仓库管理员', '13800138003', 1),
('sales', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '销售员', '13800138004', 1),
('qc', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '质检员', '13800138005', 1),
('finance', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '财务', '13800138006', 1);

-- 初始化角色
INSERT INTO sys_role (role_name, role_code, description) VALUES
('超级管理员', 'ADMIN', '系统最高权限'),
('采购主管', 'PURCHASE_MANAGER', '负责原料采购管理'),
('生产主管', 'PRODUCTION_MANAGER', '负责生产排产和工单管理'),
('仓库管理员', 'WAREHOUSE_MANAGER', '负责库存和出入库管理'),
('销售主管', 'SALES_MANAGER', '负责订单和销售管理'),
('质检员', 'QC_INSPECTOR', '负责品质巡检'),
('财务', 'FINANCE', '负责成本核算和报表');

-- 初始化用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7);

-- 初始化产品分类
INSERT INTO product_category (parent_id, category_name, category_code, sort_order) VALUES
(0, '清洁日用品', 'CLEAN', 1),
(0, '厨卫日用品', 'KITCHEN', 2),
(0, '收纳用品', 'STORAGE', 3),
(0, '一次性日用好物', 'DISPOSABLE', 4),
(1, '洗衣液系列', 'CLEAN_LAUNDRY', 1),
(1, '厨房清洁剂', 'CLEAN_KITCHEN', 2),
(1, '卫生间清洁剂', 'CLEAN_BATHROOM', 3),
(2, '厨房用具', 'KITCHEN_TOOLS', 1),
(2, '卫浴用品', 'BATHROOM_PRODUCTS', 2),
(3, '收纳盒系列', 'STORAGE_BOX', 1),
(3, '收纳袋系列', 'STORAGE_BAG', 2),
(4, '一次性餐具', 'DISPOSABLE_TABLEWARE', 1),
(4, '一次性清洁用品', 'DISPOSABLE_CLEAN', 2);

-- 初始化原材料
INSERT INTO raw_material (material_name, material_code, material_type, specification, unit, unit_price, warn_stock, is_moisture_sensitive) VALUES
('PP塑料颗粒', 'MAT_PP001', '塑料颗粒', '食品级', '吨', 8500.00, 5, 0),
('PE塑料颗粒', 'MAT_PE001', '塑料颗粒', '吹塑级', '吨', 7800.00, 5, 0),
('纯棉布料', 'MAT_COTTON001', '纯棉布料', '40支平纹', '米', 28.50, 1000, 1),
('竹纤维布料', 'MAT_BAMBOO001', '纯棉布料', '竹纤维混纺', '米', 35.00, 800, 1),
('牛皮纸', 'MAT_PAPER001', '纸质原料', '250g', '令', 120.00, 50, 1),
('瓦楞纸', 'MAT_PAPER002', '纸质原料', '三层E瓦', '平方米', 3.50, 2000, 1),
('表面活性剂', 'MAT_CHEM001', '日化助剂', 'AES-70', '吨', 9500.00, 2, 0),
('香精', 'MAT_CHEM002', '日化助剂', '柠檬香型', '公斤', 85.00, 50, 0),
('外包装纸箱', 'MAT_BOX001', '外包装纸箱', '50*30*40cm', '个', 2.50, 1000, 1),
('气泡膜', 'MAT_BOX002', '外包装纸箱', '50cm宽', '米', 1.20, 500, 1);

-- 初始化产品
INSERT INTO product (category_id, product_name, product_code, specification, unit, selling_price, cost_price, priority, status) VALUES
(5, '薰衣草洗衣液2L', 'PROD_WASH001', '2L/瓶', '瓶', 39.90, 18.50, 10, 1),
(5, '柠檬洗洁精1.5L', 'PROD_WASH002', '1.5L/瓶', '瓶', 25.90, 12.00, 8, 1),
(6, '厨房油污净500ml', 'PROD_CLEAN001', '500ml/瓶', '瓶', 29.90, 14.00, 5, 1),
(7, '马桶清洁剂500ml', 'PROD_BATH001', '500ml/瓶', '瓶', 22.90, 10.50, 5, 1),
(8, '硅胶铲勺套装', 'PROD_KITCHEN001', '5件套', '套', 69.90, 32.00, 7, 1),
(9, '纯棉毛巾3条装', 'PROD_BATH002', '34*75cm*3', '套', 49.90, 22.00, 9, 1),
(10, '塑料收纳箱大号', 'PROD_STORAGE001', '58*42*35cm', '个', 89.90, 42.00, 6, 1),
(11, '真空收纳袋套装', 'PROD_STORAGE002', '6件套含泵', '套', 59.90, 28.00, 6, 1),
(12, '一次性餐盒50只装', 'PROD_DISP001', '750ml*50', '套', 29.90, 13.00, 4, 1),
(13, '懒人抹布50片', 'PROD_DISP002', '25*25cm*50', '卷', 19.90, 8.50, 4, 1);

-- 初始化客户
INSERT INTO customer (customer_name, customer_code, contact_person, phone, address, level) VALUES
('天猫超市', 'CUST_TMALL', '张经理', '13900139001', '浙江省杭州市余杭区文一西路', 1),
('京东自营', 'CUST_JD', '李经理', '13900139002', '北京市朝阳区亦庄经济技术开发区', 1),
('沃尔玛中国', 'CUST_WALMART', '王经理', '13900139003', '广东省深圳市福田区', 1),
('大润发超市', 'CUST_RT', '赵经理', '13900139004', '上海市静安区', 2),
('永辉超市', 'CUST_YONGHUI', '刘经理', '13900139005', '福建省福州市鼓楼区', 2);
