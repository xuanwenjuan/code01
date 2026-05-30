CREATE DATABASE IF NOT EXISTS natural_dye DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE natural_dye;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role TINYINT COMMENT '角色：1-染料调配师，2-布匹采购，3-织造工坊，4-平台管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS color_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    parent_id BIGINT COMMENT '父类目ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT COMMENT '状态：1-正常，2-停产下架',
    color_code VARCHAR(20) COMMENT '颜色代码',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='染布色系类目表';

CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type TINYINT COMMENT '物料类型：1-纯棉坯布，2-麻料面料，3-天然染料，4-固色助剂，5-其他',
    batch_no VARCHAR(50) COMMENT '批次编号',
    origin VARCHAR(100) COMMENT '产地',
    weight DECIMAL(10,2) COMMENT '克重',
    unit_price DECIMAL(10,2) COMMENT '单价',
    quantity DECIMAL(10,2) COMMENT '数量',
    warning_quantity DECIMAL(10,2) COMMENT '预警数量',
    status TINYINT COMMENT '状态：1-库存充足，2-库存预警，3-停止采购',
    expiry_date DATE COMMENT '有效期至',
    is_fading TINYINT DEFAULT 0 COMMENT '是否易褪色：0-否，1-是',
    unit VARCHAR(20) COMMENT '单位',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='坯布染材库存表';

CREATE TABLE IF NOT EXISTS dye_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT COMMENT '色系类目ID',
    fabric_name VARCHAR(100) COMMENT '面料名称',
    fabric_quantity DECIMAL(10,2) COMMENT '面料数量',
    assigned_user_id BIGINT COMMENT '指派用户ID',
    status TINYINT COMMENT '状态：1-待投料，2-面料预处理，3-染料熬煮调色，4-浸泡匀染，5-固色漂洗，6-晾晒定型，7-成品裁剪出库，8-已完成，9-已暂停',
    feeding_time DATETIME COMMENT '投料时间',
    preprocess_finish_time DATETIME COMMENT '预处理完成时间',
    boiling_finish_time DATETIME COMMENT '熬煮调色完成时间',
    dyeing_finish_time DATETIME COMMENT '浸泡匀染完成时间',
    fixing_finish_time DATETIME COMMENT '固色漂洗完成时间',
    drying_finish_time DATETIME COMMENT '晾晒定型完成时间',
    cutting_finish_time DATETIME COMMENT '成品裁剪完成时间',
    completed_time DATETIME COMMENT '完成时间',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='古法染制加工工单表';

CREATE TABLE IF NOT EXISTS work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    inventory_id BIGINT COMMENT '库存ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

CREATE TABLE IF NOT EXISTS cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_id BIGINT COMMENT '色系类目ID',
    category_name VARCHAR(100) COMMENT '色系类目名称',
    statistics_date DATE COMMENT '统计日期',
    order_count INT COMMENT '订单数量',
    fabric_consumption DECIMAL(10,2) COMMENT '面料消耗量',
    fabric_cost DECIMAL(10,2) COMMENT '面料成本',
    dye_consumption DECIMAL(10,2) COMMENT '染料消耗量',
    dye_cost DECIMAL(10,2) COMMENT '染料成本',
    labor_hours DECIMAL(10,2) COMMENT '人工工时',
    labor_cost DECIMAL(10,2) COMMENT '人工成本',
    other_cost DECIMAL(10,2) COMMENT '其他成本',
    total_cost DECIMAL(10,2) COMMENT '总成本',
    total_revenue DECIMAL(10,2) COMMENT '总收入',
    profit DECIMAL(10,2) COMMENT '利润',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='染制成品成本核算表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    status TINYINT COMMENT '状态',
    error_msg TEXT COMMENT '错误信息',
    cost_time BIGINT COMMENT '耗时(ms)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', '13800138000', 4, 1),
('dyemaster', 'e10adc3949ba59abbe56e057f20f883e', '张师傅', '13800138001', 1, 1),
('purchaser', 'e10adc3949ba59abbe56e057f20f883e', '李采购', '13800138002', 2, 1),
('workshop', 'e10adc3949ba59abbe56e057f20f883e', '王工坊', '13800138003', 3, 1);

INSERT INTO color_category (category_name, parent_id, sort_order, status, color_code, description) VALUES
('草木原色', NULL, 1, 1, NULL, '天然草木原色系列'),
('靛蓝色', 1, 1, 1, '#1a476f', '靛蓝草木染'),
('栀子黄', 1, 2, 1, '#f5d030', '栀子染黄色'),
('苏木红', 1, 3, 1, '#c41e3a', '苏木染红色'),
('复配花色', NULL, 2, 1, NULL, '复配花色系列'),
('云青色', 5, 1, 1, '#7eb5d0', '复配云青色'),
('秋香色', 5, 2, 1, '#d6c86c', '复配秋香色'),
('古风禅意色', NULL, 3, 1, NULL, '古风禅意色系'),
('水墨灰', 8, 1, 1, '#888888', '水墨禅意灰'),
('茶褐色', 8, 2, 1, '#8b4513', '茶色禅意'),
('民俗特色色', NULL, 4, 1, NULL, '民俗特色色系'),
('蜡染蓝', 11, 1, 1, '#2a52be', '传统蜡染蓝'),
('扎染紫', 11, 2, 1, '#800080', '传统扎染紫');
