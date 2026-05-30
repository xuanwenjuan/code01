CREATE DATABASE IF NOT EXISTS fishing_distribution DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fishing_distribution;

DROP TABLE IF EXISTS sys_user_role;
DROP TABLE IF EXISTS sys_role;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS operation_log;
DROP TABLE IF EXISTS revenue_item;
DROP TABLE IF EXISTS revenue_statistics;
DROP TABLE IF EXISTS sorting_loss_record;
DROP TABLE IF EXISTS sorting_order_detail;
DROP TABLE IF EXISTS sorting_order;
DROP TABLE IF EXISTS sorting_team;
DROP TABLE IF EXISTS fishing_boat;
DROP TABLE IF EXISTS fish_category;

CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(200) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(500) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

CREATE TABLE fish_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID，0表示一级类目',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_type VARCHAR(50) NOT NULL COMMENT '类目类型：DEEP_SEA_FISH-深海硬骨鱼、SHORE_CRAB-近海虾蟹类、OCEAN_SHELLFISH-远洋贝类、DRIED_PRODUCT-海产干货制品',
    icon VARCHAR(500) COMMENT '类目图标',
    sort_order INT DEFAULT 0 COMMENT '排序值，越大越靠前',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停收下架 1-正常收售',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渔获类目表';

CREATE TABLE fishing_boat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '渔船ID',
    boat_code VARCHAR(50) NOT NULL UNIQUE COMMENT '渔船备案编号',
    boat_name VARCHAR(100) NOT NULL COMMENT '渔船名称',
    fleet_name VARCHAR(100) COMMENT '所属船队',
    approved_area VARCHAR(200) COMMENT '核定捕捞海域',
    tonnage DECIMAL(10,2) COMMENT '载重吨位（吨）',
    license_number VARCHAR(100) COMMENT '捕捞许可证号',
    license_expire_date DATE COMMENT '捕捞证件到期日期',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常出海 2-休整停靠 3-检修停运',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_boat_code (boat_code),
    INDEX idx_fleet_name (fleet_name),
    INDEX idx_approved_area (approved_area),
    INDEX idx_status (status),
    INDEX idx_license_expire (license_expire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出海渔船档案表';

CREATE TABLE sorting_team (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '班组ID',
    team_code VARCHAR(50) NOT NULL UNIQUE COMMENT '班组编码',
    team_name VARCHAR(100) NOT NULL COMMENT '班组名称',
    team_leader VARCHAR(50) COMMENT '班组长',
    team_leader_phone VARCHAR(20) COMMENT '班组长电话',
    member_count INT DEFAULT 0 COMMENT '成员人数',
    max_capacity DECIMAL(10,2) DEFAULT 10000.00 COMMENT '最大承载量（公斤）',
    current_load DECIMAL(10,2) DEFAULT 0.00 COMMENT '当前承载量（公斤）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用 1-启用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分拣班组表';

CREATE TABLE sorting_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    boat_id BIGINT NOT NULL COMMENT '渔船ID',
    boat_code VARCHAR(50) NOT NULL COMMENT '渔船备案编号',
    boat_name VARCHAR(100) NOT NULL COMMENT '渔船名称',
    team_id BIGINT COMMENT '分拣班组ID',
    arrival_time DATETIME NOT NULL COMMENT '靠岸时间',
    start_time DATETIME COMMENT '分拣开始时间',
    end_time DATETIME COMMENT '分拣完成时间',
    total_weight DECIMAL(10,2) COMMENT '总重量（公斤）',
    sorted_weight DECIMAL(10,2) DEFAULT 0 COMMENT '已分拣重量（公斤）',
    loss_weight DECIMAL(10,2) DEFAULT 0 COMMENT '损耗重量（公斤）',
    cold_chain_cost DECIMAL(12,2) DEFAULT 0 COMMENT '冷链成本（元）',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本（元）',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本（元）',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待卸货 2-卸货中 3-分拣中 4-打包中 5-入库完成 6-已取消',
    warning_status TINYINT DEFAULT 0 COMMENT '预警状态：0-正常 1-超时预警',
    warning_time DATETIME COMMENT '预警时间',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    FOREIGN KEY (boat_id) REFERENCES fishing_boat(id),
    FOREIGN KEY (team_id) REFERENCES sorting_team(id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_team_id (team_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渔获回港分拣工单表';

CREATE TABLE sorting_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '渔获类目ID',
    category_name VARCHAR(100) NOT NULL COMMENT '渔获类目名称',
    grade VARCHAR(20) COMMENT '品级：A-特级 B-一级 C-二级 D-三级',
    freshness_level VARCHAR(20) COMMENT '鲜活度等级：1-鲜活 2-冰鲜 3-冷冻',
    weight DECIMAL(10,2) COMMENT '重量（公斤）',
    loss_weight DECIMAL(10,2) DEFAULT 0 COMMENT '损耗重量（公斤）',
    unit_price DECIMAL(10,2) COMMENT '单价（元/公斤）',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    location VARCHAR(100) COMMENT '存放位置',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    FOREIGN KEY (order_id) REFERENCES sorting_order(id),
    FOREIGN KEY (category_id) REFERENCES fish_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分拣工单明细表';

CREATE TABLE sorting_loss_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '渔获类目ID',
    category_name VARCHAR(100) NOT NULL COMMENT '渔获类目名称',
    loss_type VARCHAR(20) NOT NULL COMMENT '损耗类型：DAMAGE-物理损坏 DECAY-腐败变质 MISSING-丢失短缺 OTHER-其他',
    loss_weight DECIMAL(10,2) NOT NULL COMMENT '损耗重量（公斤）',
    loss_amount DECIMAL(12,2) COMMENT '损耗金额（元）',
    loss_reason VARCHAR(500) COMMENT '损耗原因',
    record_by BIGINT COMMENT '登记人ID',
    record_by_name VARCHAR(50) COMMENT '登记人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    FOREIGN KEY (order_id) REFERENCES sorting_order(id),
    FOREIGN KEY (category_id) REFERENCES fish_category(id),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分拣损耗记录表';

CREATE TABLE revenue_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    statistics_type VARCHAR(50) NOT NULL COMMENT '统计类型：DAILY-日报 WEEKLY-周报 MONTHLY-月报',
    fleet_name VARCHAR(100) COMMENT '船队名称（按船队统计时使用）',
    category_id BIGINT COMMENT '类目ID（按品类统计时使用）',
    category_name VARCHAR(100) COMMENT '类目名称',
    total_catch_weight DECIMAL(12,2) DEFAULT 0 COMMENT '捕捞总产量（公斤）',
    sorting_loss_weight DECIMAL(12,2) DEFAULT 0 COMMENT '分拣折损量（公斤）',
    cold_chain_cost DECIMAL(12,2) DEFAULT 0 COMMENT '冷链储运成本（元）',
    sales_amount DECIMAL(12,2) DEFAULT 0 COMMENT '线下批发销售额（元）',
    net_profit DECIMAL(12,2) DEFAULT 0 COMMENT '净利润（元）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_date_type_fleet_category (statistics_date, statistics_type, fleet_name, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集散营收统计表';

CREATE TABLE revenue_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收支明细ID',
    item_no VARCHAR(50) NOT NULL UNIQUE COMMENT '明细编号',
    item_type VARCHAR(20) NOT NULL COMMENT '收支类型：IN-收入 OUT-支出',
    item_category VARCHAR(50) COMMENT '收支类别：SALES-销售收入 COLD_CHAIN-冷链成本 LABOR-人工成本 OTHER-其他',
    order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单编号',
    amount DECIMAL(12,2) NOT NULL COMMENT '金额（元）',
    payer_payee VARCHAR(100) COMMENT '付款方/收款方',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_item_no (item_no),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金往来明细表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    business_id BIGINT COMMENT '业务数据ID',
    business_no VARCHAR(50) COMMENT '业务编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_role VARCHAR(50) COMMENT '操作人角色',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    status TINYINT DEFAULT 1 COMMENT '操作状态：0-失败 1-成功',
    error_msg TEXT COMMENT '错误信息',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时（毫秒）',
    INDEX idx_business_id (business_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_role (role_code, role_name, description) VALUES
('SORTER', '分拣员', '负责渔获分拣操作的人员'),
('DISPATCHER', '船务调度', '负责渔船调度和工单管理的人员'),
('WAREHOUSE', '仓储管理员', '负责仓储管理的人员'),
('FINANCE', '财务管理员', '负责财务和营收统计的人员'),
('ADMIN', '系统管理员', '系统管理员，拥有所有权限');

INSERT INTO sys_user (username, password, real_name, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000'),
('sorter01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张分拣', '13800138001'),
('dispatcher01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李调度', '13800138002'),
('warehouse01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王仓储', '13800138003'),
('finance01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵财务', '13800138004');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 5),
(2, 1),
(3, 2),
(4, 3),
(5, 4);

INSERT INTO fish_category (parent_id, category_code, category_name, category_type, sort_order) VALUES
(0, 'DEEP_SEA_FISH', '深海硬骨鱼', 'DEEP_SEA_FISH', 100),
(0, 'SHORE_CRAB', '近海虾蟹类', 'SHORE_CRAB', 90),
(0, 'OCEAN_SHELLFISH', '远洋贝类', 'OCEAN_SHELLFISH', 80),
(0, 'DRIED_PRODUCT', '海产干货制品', 'DRIED_PRODUCT', 70),
(1, 'TUNA', '金枪鱼', 'DEEP_SEA_FISH', 100),
(1, 'SWORDFISH', '剑鱼', 'DEEP_SEA_FISH', 90),
(1, 'MARLIN', '马林鱼', 'DEEP_SEA_FISH', 80),
(2, 'LOBSTER', '龙虾', 'SHORE_CRAB', 100),
(2, 'CRAB', '梭子蟹', 'SHORE_CRAB', 90),
(2, 'PRAWN', '对虾', 'SHORE_CRAB', 80),
(3, 'OYSTER', '生蚝', 'OCEAN_SHELLFISH', 100),
(3, 'SCALLOP', '扇贝', 'OCEAN_SHELLFISH', 90),
(3, 'ABALONE', '鲍鱼', 'OCEAN_SHELLFISH', 80),
(4, 'FISH_SKIN', '鱼皮干', 'DRIED_PRODUCT', 100),
(4, 'FISH_SAUSAGE', '鱼肠干', 'DRIED_PRODUCT', 90);

INSERT INTO sorting_team (team_code, team_name, team_leader, team_leader_phone, member_count, max_capacity, current_load, status) VALUES
('TEAM001', '第一分拣组', '张三', '13900139001', 8, 20000.00, 0, 1),
('TEAM002', '第二分拣组', '李四', '13900139002', 10, 25000.00, 0, 1),
('TEAM003', '第三分拣组', '王五', '13900139003', 6, 15000.00, 0, 1);
