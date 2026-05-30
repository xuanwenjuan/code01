CREATE DATABASE IF NOT EXISTS wooden_door DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wooden_door;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) COMMENT '角色：purchaser-采购，designer-设计，leader-组长，quality-质检，admin-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

CREATE TABLE IF NOT EXISTS material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '原料名称',
    type VARCHAR(50) COMMENT '原料类型：wood-木材，hardware-五金，paint-油漆，other-其他',
    batch_code VARCHAR(50) UNIQUE COMMENT '批次号',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    status TINYINT DEFAULT 1 COMMENT '状态：1-充足，2-预警，3-停止采购',
    supplier VARCHAR(100) COMMENT '供应商',
    in_date DATETIME COMMENT '入库时间',
    expire_date DATETIME COMMENT '过期时间',
    is_damp TINYINT DEFAULT 0 COMMENT '是否潮湿：0-否，1-是',
    ventilate_remind_time DATETIME COMMENT '通风提醒时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单编号',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    product_category_id BIGINT COMMENT '产品分类ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    width DECIMAL(10,2) COMMENT '宽度(mm)',
    height DECIMAL(10,2) COMMENT '高度(mm)',
    quantity INT COMMENT '数量',
    wood_type VARCHAR(50) COMMENT '木材类型',
    color VARCHAR(50) COMMENT '颜色',
    current_process INT DEFAULT 0 COMMENT '当前工序：0-未开始，1-开料，2-打磨，3-拼接，4-烤漆，5-组装，6-检测，7-出库',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待排产，2-生产中，3-已完成，4-已暂停',
    plan_start_date DATETIME COMMENT '计划开始时间',
    plan_end_date DATETIME COMMENT '计划完成时间',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际完成时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE IF NOT EXISTS order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_type INT NOT NULL COMMENT '工序类型：1-开料，2-打磨，3-拼接，4-烤漆，5-组装，6-检测，7-出库',
    process_name VARCHAR(50) COMMENT '工序名称',
    sort INT COMMENT '排序',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未开始，1-进行中，2-已完成',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    wood_cost DECIMAL(10,2) DEFAULT 0 COMMENT '木材成本',
    hardware_cost DECIMAL(10,2) DEFAULT 0 COMMENT '五金成本',
    paint_cost DECIMAL(10,2) DEFAULT 0 COMMENT '油漆成本',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '人工成本',
    scrap_cost DECIMAL(10,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY uk_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

CREATE TABLE IF NOT EXISTS cost_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    cost_id BIGINT NOT NULL COMMENT '成本ID',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    cost_type INT COMMENT '成本类型：1-木材，2-五金，3-油漆，4-人工，5-报废',
    cost_type_name VARCHAR(50) COMMENT '成本类型名称',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    INDEX idx_cost_id (cost_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本明细表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '参数',
    result TEXT COMMENT '结果',
    time BIGINT COMMENT '耗时(ms)',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '123456', '管理员', '13800138000', 'admin', 1),
('purchaser', '123456', '采购专员', '13800138001', 'purchaser', 1),
('designer', '123456', '工艺设计师', '13800138002', 'designer', 1),
('leader', '123456', '生产组长', '13800138003', 'leader', 1),
('quality', '123456', '质检员', '13800138004', 'quality', 1);

INSERT INTO product_category (name, parent_id, level, sort, priority, status, description) VALUES
('平开实木门', 0, 1, 1, 10, 1, '平开实木门系列'),
('推拉落地窗', 0, 1, 2, 9, 1, '推拉落地窗系列'),
('阳台隔断窗', 0, 1, 3, 8, 1, '阳台隔断窗系列'),
('别墅定制异形门窗', 0, 1, 4, 7, 1, '别墅定制异形门窗系列'),
('橡木平开木门', 1, 2, 1, 10, 1, '橡木材质平开木门'),
('胡桃木平开木门', 1, 2, 2, 9, 1, '胡桃木材质平开木门'),
('松木平开木门', 1, 2, 3, 8, 1, '松木材质平开木门');
