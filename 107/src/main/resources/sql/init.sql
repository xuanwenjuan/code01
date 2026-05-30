CREATE DATABASE IF NOT EXISTS umbrella_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE umbrella_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '用户表';

CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '角色表';

CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id)
) COMMENT '用户角色关联表';

CREATE TABLE sys_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
    permission_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    menu_type TINYINT DEFAULT 1 COMMENT '类型 1-菜单 2-按钮',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    path VARCHAR(200) COMMENT '路由路径',
    icon VARCHAR(100) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '权限表';

CREATE TABLE sys_role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_permission (role_id, permission_id)
) COMMENT '角色权限关联表';

CREATE TABLE umbrella_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    description VARCHAR(500) COMMENT '分类描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_parent_id (parent_id)
) COMMENT '伞品样式类目表';

CREATE TABLE umbrella_style (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '款式ID',
    style_name VARCHAR(100) NOT NULL COMMENT '款式名称',
    style_code VARCHAR(50) NOT NULL UNIQUE COMMENT '款式编码',
    category_id BIGINT NOT NULL COMMENT '所属分类ID',
    base_price DECIMAL(10,2) NOT NULL COMMENT '基础价格',
    description TEXT COMMENT '款式描述',
    image_url VARCHAR(500) COMMENT '图片URL',
    production_cycle INT COMMENT '生产周期(天)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停订 1-可定制',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '伞品款式表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '原料类型 竹骨/桐油/棉纸/颜料',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    current_stock DECIMAL(10,2) DEFAULT 0 COMMENT '当前库存',
    min_stock DECIMAL(10,2) DEFAULT 0 COMMENT '最低库存预警线',
    supplier VARCHAR(200) COMMENT '供应商',
    status TINYINT DEFAULT 1 COMMENT '状态 0-断货停用 1-库存紧张 2-充足',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '制伞原料表';

CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
    purchase_date DATE COMMENT '采购日期',
    expiry_date DATE COMMENT '过期日期',
    operator_id BIGINT COMMENT '操作人ID',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '原料批次表';

CREATE TABLE custom_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    style_id BIGINT NOT NULL COMMENT '款式ID',
    color_requirement VARCHAR(200) COMMENT '颜色要求',
    pattern_design TEXT COMMENT '纹样设计',
    quantity INT NOT NULL COMMENT '定制数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
    deposit DECIMAL(10,2) DEFAULT 0 COMMENT '定金',
    deposit_status TINYINT DEFAULT 0 COMMENT '定金状态 0-未支付 1-已支付',
    deposit_pay_time DATETIME COMMENT '定金支付时间',
    remaining_amount DECIMAL(10,2) COMMENT '余款',
    remaining_pay_time DATETIME COMMENT '余款支付时间',
    order_status VARCHAR(30) DEFAULT 'PENDING_DEPOSIT' COMMENT '工单状态 PENDING_DEPOSIT-待付定金 DESIGN_CONFIRM-设计确认 ASSEMBLING-骨架拼装 OILING-上油裱纸 PAINTING-手绘装饰 FINISHED-成品验收 SHIPPED-已发货 COMPLETED-已完成 CANCELLED-已取消',
    operator_id BIGINT COMMENT '当前操作人ID',
    artisan_id BIGINT COMMENT '制伞工匠ID',
    estimated_finish_date DATE COMMENT '预计完成日期',
    actual_finish_date DATE COMMENT '实际完成日期',
    express_no VARCHAR(100) COMMENT '快递单号',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_order_status (order_status),
    KEY idx_create_time (create_time)
) COMMENT '定制生产工单表';

CREATE TABLE order_flow_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    previous_status VARCHAR(30) COMMENT '上一状态',
    current_status VARCHAR(30) NOT NULL COMMENT '当前状态',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '操作备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    KEY idx_order_id (order_id)
) COMMENT '工单流转日志表';

CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    batch_id BIGINT COMMENT '批次ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '耗用数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
    operator_id BIGINT COMMENT '操作人ID',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_order_material (order_id, material_id)
) COMMENT '工单用料明细表';

CREATE TABLE production_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报表ID',
    report_date DATE NOT NULL COMMENT '报表日期',
    style_id BIGINT NOT NULL COMMENT '款式ID',
    order_count INT DEFAULT 0 COMMENT '工单数量',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    total_sales DECIMAL(12,2) DEFAULT 0 COMMENT '销售总额',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    profit DECIMAL(12,2) DEFAULT 0 COMMENT '利润',
    profit_margin DECIMAL(5,2) DEFAULT 0 COMMENT '利润率',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_report_style (report_date, style_id)
) COMMENT '产销利润报表表';

CREATE TABLE store_sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '销售ID',
    sale_date DATE NOT NULL COMMENT '销售日期',
    store_name VARCHAR(100) NOT NULL COMMENT '门店名称',
    style_id BIGINT NOT NULL COMMENT '款式ID',
    quantity INT NOT NULL COMMENT '销售数量',
    sales_amount DECIMAL(10,2) NOT NULL COMMENT '销售金额',
    operator_id BIGINT COMMENT '操作人ID',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '门店销量表';

INSERT INTO sys_role (role_code, role_name, description) VALUES
('CRAFTSMAN', '制伞工匠', '负责制伞生产工序'),
('PURCHASER', '原料采购', '负责原料采购和库存管理'),
('STORE_MANAGER', '门店运营', '负责门店销售和客户服务'),
('FINANCE', '财务管理员', '负责财务对账和报表管理'),
('ADMIN', '系统管理员', '系统最高权限');

INSERT INTO sys_user (username, password, real_name, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000'),
('craftsman1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张师傅', '13800138001'),
('purchaser1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李采购', '13800138002'),
('store1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王店长', '13800138003'),
('finance1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵财务', '13800138004');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 5),
(2, 1),
(3, 2),
(4, 3),
(5, 4);

INSERT INTO umbrella_category (category_name, category_code, parent_id, level, sort_order, description) VALUES
('古风舞蹈伞', 'DANCE', 0, 1, 1, '用于舞蹈表演的古风油纸伞'),
('防雨实用伞', 'RAIN', 0, 1, 2, '具有防雨功能的实用油纸伞'),
('文创装饰伞', 'DECORATION', 0, 1, 3, '用于装饰的文创油纸伞'),
('非遗收藏伞', 'COLLECTION', 0, 1, 4, '具有收藏价值的非遗油纸伞');

INSERT INTO umbrella_category (category_name, category_code, parent_id, level, sort_order, description) VALUES
('古典舞伞', 'DANCE_CLASSIC', 1, 2, 1, '古典舞蹈专用伞'),
('民族舞伞', 'DANCE_ETHNIC', 1, 2, 2, '民族舞蹈专用伞'),
('日常防雨伞', 'RAIN_DAILY', 2, 2, 1, '日常使用防雨伞'),
('旅行便携伞', 'RAIN_TRAVEL', 2, 2, 2, '旅行便携防雨伞'),
('家居装饰伞', 'DECOR_HOME', 3, 2, 1, '家居装饰用伞'),
('商务礼品伞', 'DECOR_GIFT', 3, 2, 2, '商务礼品用伞'),
('大师作品伞', 'COLLECTION_MASTER', 4, 2, 1, '大师手工作品'),
('限量版伞', 'COLLECTION_LIMITED', 4, 2, 2, '限量收藏版');

INSERT INTO material (material_code, material_name, material_type, unit, unit_price, current_stock, min_stock, supplier) VALUES
('BAMBOO_001', '精品竹骨', '竹骨', '根', 25.00, 500, 100, '福建竹艺厂'),
('BAMBOO_002', '普通竹骨', '竹骨', '根', 15.00, 800, 200, '浙江竹制品厂'),
('OIL_001', '一级桐油', '桐油', '升', 80.00, 200, 50, '贵州桐油厂'),
('OIL_002', '二级桐油', '桐油', '升', 50.00, 300, 80, '湖南桐油厂'),
('PAPER_001', '精品棉纸', '棉纸', '张', 5.00, 2000, 500, '安徽宣纸厂'),
('PAPER_002', '普通棉纸', '棉纸', '张', 2.00, 3000, 800, '四川棉纸厂'),
('PAINT_001', '国画颜料套装', '颜料', '套', 150.00, 100, 30, '上海美术颜料厂'),
('PAINT_002', '矿物颜料', '颜料', '克', 10.00, 5000, 1000, '云南矿物颜料厂');
