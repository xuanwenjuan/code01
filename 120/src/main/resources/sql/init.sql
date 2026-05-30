CREATE DATABASE IF NOT EXISTS tarp_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tarp_management;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

CREATE TABLE sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation VARCHAR(100) COMMENT '操作内容',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

CREATE TABLE tarp_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0下架 1上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='篷布样式类目表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '材料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编号',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    material_type VARCHAR(50) COMMENT '材料类型',
    specification VARCHAR(200) COMMENT '规格',
    origin VARCHAR(100) COMMENT '产地',
    batch_no VARCHAR(50) UNIQUE COMMENT '批次编号',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 10 COMMENT '预警数量',
    status TINYINT DEFAULT 1 COMMENT '状态 0停止采购 1库存预警 2库存充足',
    expire_time DATETIME COMMENT '过期时间',
    is_oil TINYINT DEFAULT 0 COMMENT '是否油脂类 0否 1是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缝制原辅材料表';

CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    category_id BIGINT NOT NULL COMMENT '篷布分类ID',
    quantity INT NOT NULL COMMENT '生产数量',
    status TINYINT DEFAULT 0 COMMENT '状态 0待下料 1裁剪中 2浸油中 3缝制中 4组装中 5质检中 6已完成 7已暂停',
    cutter_id BIGINT COMMENT '裁剪技工ID',
    oiler_id BIGINT COMMENT '浸油技工ID',
    sewer_id BIGINT COMMENT '缝制技工ID',
    assembler_id BIGINT COMMENT '组装技工ID',
    inspector_id BIGINT COMMENT '质检技工ID',
    material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '材料费用',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '工时费用',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总费用',
    expect_time DATETIME COMMENT '预计完成时间',
    start_time DATETIME COMMENT '开始时间',
    finish_time DATETIME COMMENT '完成时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='手工缝制加工工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) COMMENT '材料名称',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

CREATE TABLE work_order_status_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    old_status TINYINT COMMENT '原状态',
    new_status TINYINT COMMENT '新状态',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单状态流转日志表';

CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    category_id BIGINT NOT NULL COMMENT '篷布分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    total_orders INT DEFAULT 0 COMMENT '总工单数',
    total_quantity INT DEFAULT 0 COMMENT '总生产数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '面料耗材费用',
    oil_process_cost DECIMAL(12,2) DEFAULT 0 COMMENT '浸油加工开销',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '手工缝制工时费',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '销售收入',
    profit DECIMAL(12,2) DEFAULT 0 COMMENT '利润',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='篷布产销成本统计表';

INSERT INTO sys_role (role_code, role_name, description) VALUES
('ROLE_ADMIN', '平台管理员', '系统最高权限管理员'),
('ROLE_BUYER', '面料采购员', '负责面料采购管理'),
('ROLE_TAILOR', '缝制技工', '负责手工缝制加工'),
('ROLE_WAREHOUSE', '仓储调度', '负责仓储调度管理');

INSERT INTO sys_user (username, password, real_name, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000'),
('buyer01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '采购员张三', '13800138001'),
('tailor01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '技工李四', '13800138002'),
('warehouse01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '调度王五', '13800138003');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

INSERT INTO tarp_category (parent_id, category_name, category_code, sort_order) VALUES
(0, '农用遮雨篷', 'AGRICULTURAL', 1),
(0, '渔船船用篷', 'FISHING', 2),
(0, '户外仓储篷', 'STORAGE', 3),
(0, '复古马车篷', 'CARRIAGE', 4),
(1, '大棚专用篷', 'AGRICULTURAL_GREENHOUSE', 1),
(1, '农田防雨篷', 'AGRICULTURAL_FIELD', 2),
(2, '渔船遮阳篷', 'FISHING_SHADING', 1),
(2, '渔船防雨篷', 'FISHING_RAIN', 2),
(3, '仓库顶篷', 'STORAGE_TOP', 1),
(3, '侧墙篷', 'STORAGE_SIDE', 2),
(4, '古典马车篷', 'CARRIAGE_CLASSIC', 1),
(4, '欧式马车篷', 'CARRIAGE_EUROPEAN', 2);

INSERT INTO material (material_code, material_name, material_type, specification, origin, batch_no, unit, unit_price, stock_quantity, warning_quantity, status, is_oil) VALUES
('MAT001', '纯棉厚坯布', '面料', '100cm宽', '江苏苏州', 'BATCH2024001', '米', 25.50, 500, 50, 2, 0),
('MAT002', '天然防水桐油', '油脂', '50L桶装', '安徽安庆', 'BATCH2024002', '升', 45.00, 200, 20, 2, 1),
('MAT003', '耐磨麻绳', '配件', '10mm直径', '浙江温州', 'BATCH2024003', '米', 2.50, 1000, 100, 2, 0),
('MAT004', '加固五金配件', '配件', '标准款', '广东佛山', 'BATCH2024004', '套', 15.00, 300, 30, 1, 0);
