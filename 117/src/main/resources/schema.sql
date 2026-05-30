CREATE DATABASE IF NOT EXISTS watch_repair DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE watch_repair;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role INT NOT NULL COMMENT '角色：1-零件选配员，2-修表技师，3-藏品管理员，4-平台管理员',
    status INT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    avatar VARCHAR(255) COMMENT '头像',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS watch_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态：1-正常，2-停产停修',
    category_code VARCHAR(50) COMMENT '类目编码',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钟表类目表';

CREATE TABLE IF NOT EXISTS repair_part (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配件ID',
    part_code VARCHAR(50) NOT NULL UNIQUE COMMENT '配件编码',
    part_name VARCHAR(100) NOT NULL COMMENT '配件名称',
    part_type VARCHAR(50) COMMENT '配件类型',
    origin VARCHAR(100) COMMENT '产地',
    compatible_models VARCHAR(500) COMMENT '适配型号',
    quantity INT DEFAULT 0 COMMENT '库存数量',
    warning_threshold INT DEFAULT 5 COMMENT '预警阈值',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    storage_location VARCHAR(100) COMMENT '存放位置',
    moisture_proof INT DEFAULT 0 COMMENT '是否防潮存放：0-否，1-是',
    status INT DEFAULT 1 COMMENT '状态：1-正常',
    remarks VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维修配件表';

CREATE TABLE IF NOT EXISTS repair_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT COMMENT '钟表类目ID',
    watch_model VARCHAR(100) COMMENT '钟表型号',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    fault_description VARCHAR(500) COMMENT '故障描述',
    status INT DEFAULT 1 COMMENT '状态：1-接收鉴定，2-故障拆解，3-零件更换，4-调校走时，5-外观修复，6-完工验收，7-已取消',
    technician_id BIGINT COMMENT '修表技师ID',
    parts_selector_id BIGINT COMMENT '零件选配员ID',
    received_time DATETIME COMMENT '接收时间',
    disassemble_time DATETIME COMMENT '拆解时间',
    parts_replace_time DATETIME COMMENT '零件更换时间',
    adjust_time DATETIME COMMENT '调校时间',
    polish_time DATETIME COMMENT '抛光时间',
    completed_time DATETIME COMMENT '完工时间',
    parts_cost DECIMAL(10,2) DEFAULT 0 COMMENT '配件费用',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '工时费用',
    appearance_cost DECIMAL(10,2) DEFAULT 0 COMMENT '外观修复费用',
    total_amount DECIMAL(10,2) DEFAULT 0 COMMENT '总费用',
    inspection_report TEXT COMMENT '检测报告',
    remarks VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维修工单表';

CREATE TABLE IF NOT EXISTS work_order_part (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT COMMENT '工单ID',
    part_id BIGINT COMMENT '配件ID',
    part_code VARCHAR(50) COMMENT '配件编码',
    part_name VARCHAR(100) COMMENT '配件名称',
    quantity INT DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价',
    total_price DECIMAL(10,2) DEFAULT 0 COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单配件关联表';

CREATE TABLE IF NOT EXISTS revenue_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    category_id BIGINT COMMENT '类目ID',
    category_name VARCHAR(100) COMMENT '类目名称',
    statistics_date DATE COMMENT '统计日期',
    order_count INT DEFAULT 0 COMMENT '工单数量',
    parts_cost_total DECIMAL(10,2) DEFAULT 0 COMMENT '配件费用总计',
    labor_cost_total DECIMAL(10,2) DEFAULT 0 COMMENT '工时费用总计',
    appearance_cost_total DECIMAL(10,2) DEFAULT 0 COMMENT '外观修复费用总计',
    consignment_profit DECIMAL(10,2) DEFAULT 0 COMMENT '寄售利润',
    total_revenue DECIMAL(10,2) DEFAULT 0 COMMENT '总营收',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营收统计表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(200) COMMENT '操作描述',
    method VARCHAR(200) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    duration INT COMMENT '耗时(ms)',
    status INT DEFAULT 1 COMMENT '状态：0-失败，1-成功',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '超级管理员', 4, 1),
('technician01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张师傅', 2, 1),
('selector01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李选配员', 1, 1),
('admin01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王管理员', 3, 1);

INSERT INTO watch_category (category_name, parent_id, level, sort, category_code) VALUES
('座钟', 0, 1, 1, 'C001'),
('怀表', 0, 1, 2, 'C002'),
('老式挂钟', 0, 1, 3, 'C003'),
('机械腕表', 0, 1, 4, 'C004'),
('复古座钟', 1, 2, 1, 'C001001'),
('工艺座钟', 1, 2, 2, 'C001002'),
('古董怀表', 2, 2, 1, 'C002001'),
('现代怀表', 2, 2, 2, 'C002002'),
('欧式挂钟', 3, 2, 1, 'C003001'),
('中式挂钟', 3, 2, 2, 'C003002'),
('瑞士腕表', 4, 2, 1, 'C004001'),
('国产腕表', 4, 2, 2, 'C004002');