CREATE DATABASE IF NOT EXISTS camping_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE camping_db;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    role TINYINT COMMENT '角色：1-管理员，2-运营选品，3-仓储备货，4-分销团长',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    name VARCHAR(100) NOT NULL COMMENT '类目名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    icon VARCHAR(255) COMMENT '类目图标',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='装备类目表';

CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    name VARCHAR(100) NOT NULL COMMENT '物料名称',
    type TINYINT COMMENT '类型：1-面料材质，2-五金配件，3-定制LOGO耗材，4-配件规格参数',
    batch_code VARCHAR(50) COMMENT '批次编码',
    spec VARCHAR(255) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) COMMENT '预警数量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-充足备货，2-库存紧张，3-停采断货',
    expiry_date DATE COMMENT '有效期',
    supplier VARCHAR(100) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料库存表';

CREATE TABLE IF NOT EXISTS group_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(50) UNIQUE COMMENT '订单编号',
    leader_id BIGINT NOT NULL COMMENT '团长ID',
    group_name VARCHAR(100) NOT NULL COMMENT '团购名称',
    category_id BIGINT COMMENT '类目ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    custom_requirements TEXT COMMENT '定制需求',
    target_count INT COMMENT '目标成团数量',
    current_count INT DEFAULT 0 COMMENT '当前报名数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待成团，2-确认定制需求，3-物料备货中，4-已发货，5-已完成，6-已失效，7-售后退换中',
    expire_time DATETIME COMMENT '过期时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团购订单表';

CREATE TABLE IF NOT EXISTS order_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '团员ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    member_name VARCHAR(50) NOT NULL COMMENT '团员姓名',
    member_phone VARCHAR(20) NOT NULL COMMENT '团员手机号',
    address VARCHAR(500) COMMENT '收货地址',
    quantity INT COMMENT '购买数量',
    amount DECIMAL(10,2) COMMENT '金额',
    status TINYINT DEFAULT 1 COMMENT '状态',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单团员表';

CREATE TABLE IF NOT EXISTS order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单物料关联表';

CREATE TABLE IF NOT EXISTS settlement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '结算ID',
    leader_id BIGINT NOT NULL COMMENT '团长ID',
    leader_name VARCHAR(50) COMMENT '团长姓名',
    settlement_month VARCHAR(7) COMMENT '结算月份',
    order_count INT COMMENT '订单数量',
    total_sales DECIMAL(12,2) COMMENT '总销售额',
    material_cost DECIMAL(12,2) COMMENT '物料成本',
    processing_cost DECIMAL(12,2) COMMENT '加工费用',
    shipping_cost DECIMAL(12,2) COMMENT '物流费用',
    commission_amount DECIMAL(12,2) COMMENT '佣金金额',
    profit DECIMAL(12,2) COMMENT '利润',
    status TINYINT DEFAULT 1 COMMENT '状态',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收益结算表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作',
    method VARCHAR(255) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    ip VARCHAR(50) COMMENT 'IP地址',
    duration BIGINT COMMENT '耗时(ms)',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, role, status) 
VALUES ('admin', MD5('123456'), '系统管理员', 1, 1);
