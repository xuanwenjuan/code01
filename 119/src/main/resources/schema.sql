CREATE DATABASE IF NOT EXISTS amber_customize DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE amber_customize;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(64) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(128) NOT NULL COMMENT '密码',
    real_name VARCHAR(64) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role INT COMMENT '角色：1-原石甄选员，2-玉雕师傅，3-仓储管理员，4-平台管理员',
    status INT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(64) NOT NULL COMMENT '类目名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    sort INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='雕件类目表';

CREATE TABLE IF NOT EXISTS amber_raw (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    trace_code VARCHAR(64) UNIQUE COMMENT '溯源编号',
    origin VARCHAR(128) COMMENT '产地',
    weight DECIMAL(10,2) COMMENT '原石克重',
    clarity VARCHAR(64) COMMENT '通透净度',
    inclusions VARCHAR(256) COMMENT '内含包裹物',
    status INT DEFAULT 1 COMMENT '状态：1-货源充足，2-货源紧缺，3-绝矿断货',
    locked INT DEFAULT 0 COMMENT '锁定状态：0-未锁定，1-已锁定',
    lock_order_id BIGINT COMMENT '锁定订单ID',
    storage_date DATE COMMENT '入库日期',
    remark VARCHAR(512) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原石货源档案表';

CREATE TABLE IF NOT EXISTS custom_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(64) UNIQUE COMMENT '订单编号',
    raw_id BIGINT COMMENT '原石ID',
    category_id BIGINT COMMENT '类目ID',
    customer_name VARCHAR(64) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    theme_description VARCHAR(512) COMMENT '题材描述',
    drawing_url VARCHAR(256) COMMENT '设计图纸URL',
    status INT DEFAULT 1 COMMENT '状态：1-待确认，2-设计中，3-去皮开形中，4-精细雕琢中，5-抛光中，6-复检交付中，7-已完成，8-已失效，9-已取消',
    carver_id BIGINT COMMENT '玉雕师傅ID',
    carving_hours DECIMAL(10,2) COMMENT '雕刻工时',
    raw_cost DECIMAL(12,2) COMMENT '原石成本',
    material_cost DECIMAL(12,2) COMMENT '耗材费用',
    labor_cost DECIMAL(12,2) COMMENT '人工费用',
    polishing_cost DECIMAL(12,2) COMMENT '抛光费用',
    other_cost DECIMAL(12,2) COMMENT '其他费用',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    total_price DECIMAL(12,2) COMMENT '订单总价',
    profit DECIMAL(12,2) COMMENT '利润',
    confirm_time DATETIME COMMENT '确认时间',
    complete_time DATETIME COMMENT '完成时间',
    remark VARCHAR(512) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定制工单表';

CREATE TABLE IF NOT EXISTS profit_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT COMMENT '订单ID',
    order_no VARCHAR(64) COMMENT '订单编号',
    category_id BIGINT COMMENT '类目ID',
    category_name VARCHAR(64) COMMENT '类目名称',
    raw_cost DECIMAL(12,2) COMMENT '原石成本',
    material_cost DECIMAL(12,2) COMMENT '耗材成本',
    labor_cost DECIMAL(12,2) COMMENT '人工成本',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    order_price DECIMAL(12,2) COMMENT '订单收入',
    profit DECIMAL(12,2) COMMENT '利润',
    profit_rate DECIMAL(10,4) COMMENT '利润率%',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收益记录表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(64) COMMENT '操作人用户名',
    module VARCHAR(64) COMMENT '模块',
    operation VARCHAR(128) COMMENT '操作',
    method VARCHAR(128) COMMENT '方法名',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(64) COMMENT 'IP地址',
    status INT COMMENT '状态：0-失败，1-成功',
    error_msg TEXT COMMENT '错误信息',
    duration BIGINT COMMENT '耗时(ms)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '13800000000', 4, 1);

INSERT INTO category (name, parent_id, sort, status) VALUES
('随形原石件', 0, 1, 1),
('人物佛像雕件', 0, 2, 1),
('花鸟瑞兽雕件', 0, 3, 1),
('手串配饰件', 0, 4, 1),
('观音', 2, 1, 1),
('弥勒佛', 2, 2, 1),
('貔貅', 3, 1, 1),
('龙凤', 3, 2, 1);
