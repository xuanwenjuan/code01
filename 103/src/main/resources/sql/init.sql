CREATE DATABASE IF NOT EXISTS mushroom_traceability DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mushroom_traceability;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色: HARVESTER-采收员, QUALITY-质检, WAREHOUSE-仓储, OPERATOR-运营, ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE mushroom_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID, 0表示顶级类目',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_type VARCHAR(20) NOT NULL COMMENT '类目类型: FRESH-鲜品, DRIED-干制, MEDICINAL-药用, PREPARED-预制食材',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    icon VARCHAR(255) COMMENT '类目图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_wild TINYINT DEFAULT 0 COMMENT '是否野生: 0-否, 1-是',
    is_forbidden TINYINT DEFAULT 0 COMMENT '是否禁采: 0-否, 1-是',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
    origin_areas TEXT COMMENT '产地信息(JSON)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菌菇品类类目表';

CREATE TABLE production_area (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '产区ID',
    area_code VARCHAR(50) NOT NULL UNIQUE COMMENT '产区唯一编码',
    area_name VARCHAR(100) NOT NULL COMMENT '产区名称',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    district VARCHAR(50) COMMENT '区县',
    altitude INT COMMENT '海拔高度(米)',
    climate VARCHAR(200) COMMENT '气候环境描述',
    main_categories TEXT COMMENT '盛产品类(JSON数组)',
    harvest_cycle VARCHAR(100) COMMENT '采收周期',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态: NORMAL-正常, FORBIDDEN-封禁',
    is_rainy_season TINYINT DEFAULT 0 COMMENT '是否雨季: 0-否, 1-是',
    warning_message VARCHAR(500) COMMENT '封禁预警信息',
    sort_order INT DEFAULT 0 COMMENT '展示排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_area_code (area_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='山林产区档案表';

CREATE TABLE harvest_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    task_code VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    area_id BIGINT NOT NULL COMMENT '产区ID',
    area_name VARCHAR(100) COMMENT '产区名称',
    category_ids TEXT COMMENT '目标品类ID(JSON数组)',
    harvester_id BIGINT COMMENT '采收员ID',
    harvester_name VARCHAR(50) COMMENT '采收员姓名',
    task_description TEXT COMMENT '任务描述',
    expected_quantity DECIMAL(10,2) COMMENT '预计采收量(公斤)',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际采收量(公斤)',
    task_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '任务状态: PENDING-待派发, ASSIGNED-已派发, COLLECTING-采集中, QUALITY_CHECK-质检中, WAREHOUSE-已入库, SHIPPED-已发货, EXPIRED-已失效, CANCELLED-已取消',
    quality_level VARCHAR(20) COMMENT '品质等级: A-特级, B-一级, C-二级, D-不合格',
    quality_remark TEXT COMMENT '质检备注',
    warehouse_time DATETIME COMMENT '入库时间',
    ship_time DATETIME COMMENT '发货时间',
    expire_time DATETIME NOT NULL COMMENT '任务失效时间',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_task_code (task_code),
    INDEX idx_harvester_id (harvester_id),
    INDEX idx_task_status (task_status),
    INDEX idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='野外采收任务表';

CREATE TABLE harvest_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    category_id BIGINT NOT NULL COMMENT '品类ID',
    category_name VARCHAR(100) COMMENT '品类名称',
    harvest_quantity DECIMAL(10,2) COMMENT '采收数量(公斤)',
    loss_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量(公斤)',
    quality_level VARCHAR(20) COMMENT '品质等级',
    harvest_location VARCHAR(200) COMMENT '采收地点',
    harvest_time DATETIME COMMENT '采收时间',
    harvester_remark TEXT COMMENT '采收备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采收明细表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    biz_type VARCHAR(50) COMMENT '业务类型',
    biz_id BIGINT COMMENT '业务ID',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_content TEXT COMMENT '操作内容',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_role VARCHAR(20) COMMENT '操作人角色',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_biz (biz_type, biz_id),
    INDEX idx_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

CREATE TABLE sales_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    category_id BIGINT COMMENT '品类ID',
    category_name VARCHAR(100) COMMENT '品类名称',
    area_id BIGINT COMMENT '产区ID',
    area_name VARCHAR(100) COMMENT '产区名称',
    harvest_total DECIMAL(10,2) DEFAULT 0 COMMENT '采收总量(公斤)',
    loss_total DECIMAL(10,2) DEFAULT 0 COMMENT '损耗总量(公斤)',
    logistics_cost DECIMAL(12,2) DEFAULT 0 COMMENT '冷链物流成本',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '批发营收',
    net_profit DECIMAL(12,2) DEFAULT 0 COMMENT '净利润',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_date_category_area (statistics_date, category_id, area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产销收支统计表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', '13800138000', 'ADMIN', 1),
('harvester1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张三', '13800138001', 'HARVESTER', 1),
('quality1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李四', '13800138002', 'QUALITY', 1),
('warehouse1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王五', '13800138003', 'WAREHOUSE', 1),
('operator1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '赵六', '13800138004', 'OPERATOR', 1);