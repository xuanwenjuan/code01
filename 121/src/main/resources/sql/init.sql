CREATE DATABASE IF NOT EXISTS ancient_paper_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ancient_paper_db;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role TINYINT NOT NULL COMMENT '角色：1-草料采割员，2-抄纸工匠，3-库房管存，4-平台管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS paper_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    sort_order INT DEFAULT 0 COMMENT '排序优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停产下架，1-正常销售',
    level INT DEFAULT 1 COMMENT '分类层级',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='纸品品类类目表';

CREATE TABLE IF NOT EXISTS forage_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编号',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称：构树皮、竹料、桑皮、植物胶料等',
    origin_place VARCHAR(200) COMMENT '采收产地',
    fiber_degree DECIMAL(5,2) COMMENT '纤维化程度',
    quantity DECIMAL(10,2) COMMENT '库存数量(公斤)',
    unit_price DECIMAL(10,2) COMMENT '单价(元/公斤)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-库存充足，2-库存预警，3-停收断料',
    moisture_warning TINYINT DEFAULT 0 COMMENT '防潮霉变预警：0-正常，1-预警',
    harvest_date DATE COMMENT '采收日期',
    warehouse_location VARCHAR(100) COMMENT '存放位置',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_batch_no (batch_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='造纸草料原料表';

CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '纸品分类ID',
    target_quantity DECIMAL(10,2) COMMENT '目标产量(张)',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际产量(张)',
    status TINYINT DEFAULT 1 COMMENT '工单状态：1-待浸泡腐熟，2-待捣料打浆，3-待竹网抄纸，4-待晾晒脱水，5-待砑光整平，6-待裁切规整，7-已入库，8-已冻结',
    soak_start_time DATETIME COMMENT '浸泡开始时间',
    soak_end_time DATETIME COMMENT '浸泡结束时间',
    pulp_start_time DATETIME COMMENT '捣料开始时间',
    pulp_end_time DATETIME COMMENT '捣料结束时间',
    paper_start_time DATETIME COMMENT '抄纸开始时间',
    paper_end_time DATETIME COMMENT '抄纸结束时间',
    dry_start_time DATETIME COMMENT '晾晒开始时间',
    dry_end_time DATETIME COMMENT '晾晒结束时间',
    calender_start_time DATETIME COMMENT '砑光开始时间',
    calender_end_time DATETIME COMMENT '砑光结束时间',
    cut_start_time DATETIME COMMENT '裁切开始时间',
    cut_end_time DATETIME COMMENT '裁切结束时间',
    in_warehouse_time DATETIME COMMENT '入库时间',
    craftsman_id BIGINT COMMENT '工匠ID',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='古法抄造生产工单表';

CREATE TABLE IF NOT EXISTS order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量(公斤)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料使用明细表';

CREATE TABLE IF NOT EXISTS finance_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    category_id BIGINT NOT NULL COMMENT '纸品分类ID',
    order_id BIGINT COMMENT '关联工单ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '草料采购费用',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人力沤制成本',
    work_hour_cost DECIMAL(12,2) DEFAULT 0 COMMENT '抄造工时开销',
    sales_revenue DECIMAL(12,2) DEFAULT 0 COMMENT '线下订单营收',
    total_profit DECIMAL(12,2) DEFAULT 0 COMMENT '总利润',
    production_quantity DECIMAL(10,2) COMMENT '生产数量',
    sales_quantity DECIMAL(10,2) COMMENT '销售数量',
    stat_date DATE COMMENT '统计日期',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_ledger_no (ledger_no),
    INDEX idx_category_id (category_id),
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='纸品产销收支台账表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation_module VARCHAR(100) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc TEXT COMMENT '操作描述',
    request_params TEXT COMMENT '请求参数',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800138000', 4, 1),
('forage1', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138001', 1, 1),
('craftsman1', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800138002', 2, 1),
('warehouse1', 'e10adc3949ba59abbe56e057f20f883e', '王五', '13800138003', 3, 1);

INSERT INTO paper_category (parent_id, category_name, category_code, sort_order, status, level) VALUES
(0, '书画专用纸', 'SHUHUA', 1, 1, 1),
(0, '古籍修复纸', 'GUJI', 2, 1, 1),
(0, '民俗祭祀纸', 'MINSU', 3, 1, 1),
(0, '文创工艺纸', 'WENCHUANG', 4, 1, 1),
(1, '宣纸', 'XUANZHI', 1, 1, 2),
(1, '皮纸', 'PIZHI', 2, 1, 2),
(1, '麻纸', 'MAZHI', 3, 1, 2),
(2, '修复用棉纸', 'MIANZHI', 1, 1, 2),
(2, '修复用竹纸', 'ZHUZHI', 2, 1, 2),
(3, '黄纸', 'HUANGZHI', 1, 1, 2),
(3, '白纸', 'BAIZHI', 2, 1, 2),
(4, '灯笼纸', 'DENGLONG', 1, 1, 2),
(4, '伞纸', 'SANZHI', 2, 1, 2),
(4, '剪纸专用纸', 'JIANZHI', 3, 1, 2);
