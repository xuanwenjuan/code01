CREATE DATABASE IF NOT EXISTS horncomb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE horncomb;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
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

CREATE TABLE comb_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    level INT DEFAULT 1 COMMENT '层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0下架 1上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='梳型款式类目表';

CREATE TABLE horn_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编号',
    horn_type VARCHAR(50) NOT NULL COMMENT '牛角类型 白水牛角/黑水牛角/黄牛角',
    origin VARCHAR(100) COMMENT '产地',
    thickness DECIMAL(5,2) COMMENT '厚度(mm)',
    grade VARCHAR(20) COMMENT '品级 A级/B级/C级',
    weight DECIMAL(10,2) COMMENT '重量(g)',
    quantity INT DEFAULT 0 COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    stock_status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '库存状态 NORMAL充足/WARNING预警/OUT断货',
    warning_quantity INT DEFAULT 10 COMMENT '预警数量',
    expire_remind_date DATE COMMENT '到期提醒日期',
    purchase_date DATE COMMENT '采购日期',
    purchaser_id BIGINT COMMENT '采购人ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='牛角原料库存表';

CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '梳型类目ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_batch_no VARCHAR(50) COMMENT '原料批次号',
    production_quantity INT NOT NULL COMMENT '生产数量',
    material_usage DECIMAL(10,2) COMMENT '用料重量(g)',
    craftsman_id BIGINT COMMENT '工匠ID',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态 PENDING待下料/CUTTING开料裁切/GRINDING粗修打磨/CARVING纹路雕花/POLISHING抛光顺滑/TRIMMING边角精修/INSPECTING成品质检/FINISHED已入库/SUSPENDED已搁置',
    cut_start_time DATETIME COMMENT '开料开始时间',
    cut_end_time DATETIME COMMENT '开料完成时间',
    grind_start_time DATETIME COMMENT '打磨开始时间',
    grind_end_time DATETIME COMMENT '打磨完成时间',
    carve_start_time DATETIME COMMENT '雕花开始时间',
    carve_end_time DATETIME COMMENT '雕花完成时间',
    polish_start_time DATETIME COMMENT '抛光开始时间',
    polish_end_time DATETIME COMMENT '抛光完成时间',
    trim_start_time DATETIME COMMENT '精修开始时间',
    trim_end_time DATETIME COMMENT '精修完成时间',
    inspect_start_time DATETIME COMMENT '质检开始时间',
    inspect_end_time DATETIME COMMENT '质检完成时间',
    pass_quantity INT DEFAULT 0 COMMENT '合格数量',
    fail_quantity INT DEFAULT 0 COMMENT '不合格数量',
    work_hours DECIMAL(5,2) COMMENT '工时(h)',
    hourly_wage DECIMAL(10,2) COMMENT '工时费单价',
    total_labor_cost DECIMAL(12,2) COMMENT '总工费',
    material_cost DECIMAL(12,2) COMMENT '原料成本',
    consumable_cost DECIMAL(12,2) DEFAULT 0 COMMENT '耗材成本',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE profit_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    category_id BIGINT NOT NULL COMMENT '梳型类目ID',
    statistical_month VARCHAR(7) NOT NULL COMMENT '统计月份 YYYY-MM',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    sales_quantity INT DEFAULT 0 COMMENT '销售数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料采购费用',
    consumable_cost DECIMAL(12,2) DEFAULT 0 COMMENT '打磨耗材支出',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '手工雕琢工时费',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '线下售卖营收',
    gross_profit DECIMAL(12,2) DEFAULT 0 COMMENT '毛利润',
    gross_profit_margin DECIMAL(5,2) DEFAULT 0 COMMENT '毛利率%',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产销利润台账表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation_module VARCHAR(100) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    request_method VARCHAR(20) COMMENT '请求方法',
    request_url VARCHAR(200) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    execute_time BIGINT COMMENT '执行时长(ms)',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_role (role_code, role_name, description) VALUES
('MATERIAL_SELECTOR', '原料采选员', '负责牛角原料的采购和入库管理'),
('CRAFTSMAN', '雕琢工匠', '负责牛角梳的手工雕琢生产'),
('WAREHOUSE_MANAGER', '库房管理员', '负责原料和成品的库存管理'),
('ADMIN', '平台管理员', '系统管理员，拥有全部权限');

INSERT INTO sys_user (username, password, real_name, phone, role_code) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu2', '管理员', '13800138000', 'ADMIN'),
('selector1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu2', '张三', '13800138001', 'MATERIAL_SELECTOR'),
('craftsman1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu2', '李四', '13800138002', 'CRAFTSMAN'),
('warehouse1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIu2', '王五', '13800138003', 'WAREHOUSE_MANAGER');

INSERT INTO comb_category (parent_id, category_name, category_code, level, sort_order) VALUES
(0, '养生按摩梳', 'HEALTH_MASSAGE', 1, 1),
(0, '古风雕花梳', 'ANCIENT_CARVED', 1, 2),
(0, '随身便携梳', 'PORTABLE', 1, 3),
(0, '收藏工艺梳', 'COLLECTION', 1, 4),
(1, '宽齿按摩梳', 'WIDE_TOOTH_MASSAGE', 2, 1),
(1, '气囊按摩梳', 'AIRBAG_MASSAGE', 2, 2),
(2, '龙凤呈祥梳', 'DRAGON_PHOENIX', 2, 1),
(2, '梅兰竹菊梳', 'PLUM_ORCHID', 2, 2),
(3, '迷你折叠梳', 'MINI_FOLDABLE', 2, 1),
(3, '钥匙扣梳', 'KEYCHAIN', 2, 2),
(4, '限量珍藏款', 'LIMITED_EDITION', 2, 1),
(4, '大师手作款', 'MASTER_CREATION', 2, 2);
