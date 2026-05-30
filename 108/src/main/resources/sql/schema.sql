CREATE DATABASE IF NOT EXISTS instrument_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE instrument_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) NOT NULL COMMENT '角色: ADMIN-平台管理员, ESTIMATOR-估价专员, WAREHOUSE-仓储管理员, CRAFTSMAN-翻新匠人',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE instrument_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID, 0表示顶级类目',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    category_type VARCHAR(30) NOT NULL COMMENT '类目类型: STRING-弦乐器, WIND-吹奏乐器, PERCUSSION-打击乐器, CLASSIC-小众古典乐器',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-停收下架, 1-正常收售',
    description TEXT COMMENT '类目描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='乐器品类类目表';

CREATE TABLE instrument_archive (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '档案ID',
    trace_no VARCHAR(50) NOT NULL UNIQUE COMMENT '乐器唯一溯源编号',
    category_id BIGINT NOT NULL COMMENT '乐器类目ID',
    brand VARCHAR(100) NOT NULL COMMENT '品牌',
    production_year INT COMMENT '出产年份',
    model VARCHAR(100) COMMENT '型号',
    condition_level VARCHAR(20) NOT NULL COMMENT '品相成色: EXCELLENT-优秀, GOOD-良好, FAIR-一般, POOR-较差',
    accessories_complete TINYINT DEFAULT 1 COMMENT '配件齐全度: 0-不全, 1-齐全',
    accessories_desc TEXT COMMENT '配件说明',
    appearance_desc TEXT COMMENT '外观描述',
    status VARCHAR(30) NOT NULL COMMENT '状态: TO_REFURBISH-待翻新, REFURBISHING-翻新中, TO_SELL-待寄售, SOLD-已售出',
    seller_id BIGINT COMMENT '卖家用户ID',
    estimated_price DECIMAL(12,2) COMMENT '估价(元)',
    sale_price DECIMAL(12,2) COMMENT '实际售价(元)',
    last_maintain_time DATETIME COMMENT '上次保养时间',
    next_maintain_time DATETIME COMMENT '下次保养提醒时间',
    maintain_cycle_days INT DEFAULT 180 COMMENT '保养周期(天)',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_trace_no (trace_no),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='寄售乐器档案表';

CREATE TABLE refurbish_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    work_order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    archive_id BIGINT NOT NULL COMMENT '乐器档案ID',
    trace_no VARCHAR(50) NOT NULL COMMENT '乐器溯源编号',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    receive_type VARCHAR(20) NOT NULL COMMENT '收品方式: DOOR_PICKUP-上门取件, SHOP_DELIVERY-门店送品',
    receive_address TEXT COMMENT '收品地址',
    receive_time DATETIME COMMENT '收品时间',
    receive_user_id BIGINT COMMENT '收品人ID',
    estimator_id BIGINT COMMENT '估价专员ID',
    estimate_time DATETIME COMMENT '估价时间',
    estimate_remark TEXT COMMENT '估价备注',
    craftsman_id BIGINT COMMENT '翻新匠人ID',
    status VARCHAR(30) NOT NULL COMMENT '工单状态: PENDING-待估价, ESTIMATING-估价中, ESTIMATED-已估价待确认, SHELVED-已搁置, REFURBISHING-翻新中, COMPLETED-已完工, CANCELLED-已取消',
    status_confirm_time DATETIME COMMENT '状态确认时间',
    is_timeout_reminded TINYINT DEFAULT 0 COMMENT '是否已超时提醒: 0-否, 1-是',
    actual_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '实际翻新耗材费用',
    actual_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '实际人工工时费',
    total_refurbish_cost DECIMAL(12,2) DEFAULT 0 COMMENT '翻新总费用',
    complete_time DATETIME COMMENT '完工时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_work_order_no (work_order_no),
    INDEX idx_archive_id (archive_id),
    INDEX idx_status (status),
    INDEX idx_estimator_id (estimator_id),
    INDEX idx_craftsman_id (craftsman_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻新工单表';

CREATE TABLE work_order_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '步骤ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    step_type VARCHAR(30) NOT NULL COMMENT '步骤类型: IDENTIFY-实物鉴定, DISASSEMBLE-拆解清洁, PARTS_REPLACE-配件更换, TUNING-调音校准, FINAL_CHECK-最终校验',
    step_name VARCHAR(50) NOT NULL COMMENT '步骤名称',
    step_desc TEXT COMMENT '步骤描述',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operate_time DATETIME COMMENT '操作时间',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '耗材费用',
    labor_hours DECIMAL(8,2) DEFAULT 0 COMMENT '工时(小时)',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工费用',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-未开始, 1-进行中, 2-已完成',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单步骤明细表';

CREATE TABLE profit_share (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分账ID',
    share_no VARCHAR(50) NOT NULL UNIQUE COMMENT '分账编号',
    archive_id BIGINT NOT NULL COMMENT '乐器档案ID',
    trace_no VARCHAR(50) NOT NULL COMMENT '乐器溯源编号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    category_id BIGINT NOT NULL COMMENT '类目ID',
    receive_channel VARCHAR(30) NOT NULL COMMENT '收品渠道: ONLINE-线上预约, OFFLINE-门店上门, REFERRAL-转介绍',
    sale_price DECIMAL(12,2) NOT NULL COMMENT '成交价格',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '翻新耗材费用',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时费',
    platform_commission_rate DECIMAL(5,2) DEFAULT 10.00 COMMENT '平台佣金比例(%)',
    platform_commission DECIMAL(12,2) DEFAULT 0 COMMENT '平台服务佣金',
    other_cost DECIMAL(12,2) DEFAULT 0 COMMENT '其他费用',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    seller_profit DECIMAL(12,2) DEFAULT 0 COMMENT '卖家实际到手收益',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING-待结算, SETTLED-已结算, CANCELLED-已取消',
    settle_time DATETIME COMMENT '结算时间',
    operator_id BIGINT COMMENT '操作人ID',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_share_no (share_no),
    INDEX idx_archive_id (archive_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='寄售收益分账表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    biz_type VARCHAR(30) NOT NULL COMMENT '业务类型: CATEGORY-类目, ARCHIVE-档案, WORK_ORDER-工单, SHARE-分账',
    biz_id BIGINT NOT NULL COMMENT '业务ID',
    operation_type VARCHAR(30) NOT NULL COMMENT '操作类型: CREATE-创建, UPDATE-更新, STATUS_CHANGE-状态变更, DELETE-删除',
    operation_desc TEXT COMMENT '操作描述',
    before_content TEXT COMMENT '变更前内容',
    after_content TEXT COMMENT '变更后内容',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_biz (biz_type, biz_id),
    INDEX idx_operator_id (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作留痕日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800138000', 'ADMIN', 1),
('estimator01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张估价', '13800138001', 'ESTIMATOR', 1),
('warehouse01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李仓库', '13800138002', 'WAREHOUSE', 1),
('craftsman01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王匠人', '13800138003', 'CRAFTSMAN', 1);

INSERT INTO instrument_category (parent_id, category_name, category_code, category_type, sort_order, status) VALUES
(0, '弦乐器', 'STRING', 'STRING', 1, 1),
(1, '吉他', 'GUITAR', 'STRING', 1, 1),
(1, '小提琴', 'VIOLIN', 'STRING', 2, 1),
(1, '大提琴', 'CELLO', 'STRING', 3, 1),
(1, '贝斯', 'BASS', 'STRING', 4, 1),
(0, '吹奏乐器', 'WIND', 'WIND', 2, 1),
(6, '萨克斯', 'SAXOPHONE', 'WIND', 1, 1),
(6, '长笛', 'FLUTE', 'WIND', 2, 1),
(6, '单簧管', 'CLARINET', 'WIND', 3, 1),
(0, '打击乐器', 'PERCUSSION', 'PERCUSSION', 3, 1),
(10, '架子鼓', 'DRUM', 'PERCUSSION', 1, 1),
(10, '钢琴', 'PIANO', 'PERCUSSION', 2, 1),
(0, '小众古典乐器', 'CLASSIC', 'CLASSIC', 4, 1),
(13, '古琴', 'GUQIN', 'CLASSIC', 1, 1),
(13, '古筝', 'GUZHENG', 'CLASSIC', 2, 1);
