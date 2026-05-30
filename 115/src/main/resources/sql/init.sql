CREATE DATABASE IF NOT EXISTS brush_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE brush_manufacture;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

INSERT INTO sys_user (username, password, real_name, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000'),
('material', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '毛料采购员', '13800138001'),
('worker', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '制笔师傅', '13800138002'),
('warehouse', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '库房管理员', '13800138003');

INSERT INTO sys_role (role_code, role_name, description) VALUES
('ADMIN', '平台管理员', '系统最高权限'),
('MATERIAL_WORKER', '毛料采选工', '负责原料采购和入库'),
('BRUSH_WORKER', '制笔师傅', '负责毛笔生产制作'),
('WAREHOUSE_ADMIN', '库房管理员', '负责库存管理');

INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4);

DROP TABLE IF EXISTS brush_category;
CREATE TABLE brush_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT NOT NULL DEFAULT 0 COMMENT '父类目ID，0表示顶级类目',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码',
    category_type TINYINT NOT NULL COMMENT '类目类型：1-书写用途，2-书法流派，3-笔型，4-尺寸规格',
    brush_type VARCHAR(50) COMMENT '毛笔类型：狼毫笔、羊毫笔、兼毫笔、工艺收藏笔',
    craft_type VARCHAR(100) COMMENT '工艺类型',
    suitable_for TEXT COMMENT '适用场景',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
    view_count INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-下架停产',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order),
    INDEX idx_view_count (view_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毛笔品类类目表';

INSERT INTO brush_category (parent_id, category_name, category_code, category_type, brush_type, sort_order, view_count, status) VALUES
(0, '书写用途', 'USE', 1, NULL, 1, 1520, 1),
(0, '书法流派', 'STYLE', 1, NULL, 2, 980, 1),
(0, '毛笔类型', 'TYPE', 1, NULL, 3, 2350, 1),
(3, '狼毫笔', 'TYPE_WOLF', 3, '狼毫笔', 1, 3560, 1),
(3, '羊毫笔', 'TYPE_GOAT', 3, '羊毫笔', 2, 2890, 1),
(3, '兼毫笔', 'TYPE_MIX', 3, '兼毫笔', 3, 4120, 1),
(3, '工艺收藏笔', 'TYPE_COLLECTION', 3, '工艺收藏笔', 4, 1780, 1),
(1, '楷书用笔', 'USE_REGULAR', 2, NULL, 1, 1250, 1),
(1, '行书用笔', 'USE_RUNNING', 2, NULL, 2, 980, 1),
(1, '草书用笔', 'USE_CURSIVE', 2, NULL, 3, 760, 1),
(2, '欧体专用', 'STYLE_OU', 2, NULL, 1, 650, 1),
(2, '颜体专用', 'STYLE_YAN', 2, NULL, 2, 820, 1),
(4, '大楷狼毫', 'WOLF_LARGE', 4, '狼毫笔', 1, 2100, 1),
(4, '中楷狼毫', 'WOLF_MEDIUM', 4, '狼毫笔', 2, 2800, 1),
(4, '小楷狼毫', 'WOLF_SMALL', 4, '狼毫笔', 3, 1900, 1),
(5, '大楷羊毫', 'GOAT_LARGE', 4, '羊毫笔', 1, 1800, 1),
(5, '中楷羊毫', 'GOAT_MEDIUM', 4, '羊毫笔', 2, 2200, 1),
(5, '小楷羊毫', 'GOAT_SMALL', 4, '羊毫笔', 3, 1500, 0);

DROP TABLE IF EXISTS material_archive;
CREATE TABLE material_archive (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编号',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type TINYINT NOT NULL COMMENT '原料类型：1-动物毛料，2-竹制笔杆，3-天然胶水，4-装饰配饰',
    origin_place VARCHAR(200) COMMENT '产地',
    grade VARCHAR(50) COMMENT '品级：A-优等，B-一等，C-合格',
    category_id BIGINT COMMENT '关联笔型类目ID',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '库存数量',
    locked_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '已锁定数量',
    available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '可用数量',
    warning_quantity DECIMAL(10,2) NOT NULL DEFAULT 10 COMMENT '预警库存',
    is_moisture_sensitive TINYINT NOT NULL DEFAULT 0 COMMENT '是否防潮：0-否，1-是',
    moisture_expire_date DATE COMMENT '防潮到期日',
    purchase_date DATE COMMENT '采购日期',
    supplier VARCHAR(200) COMMENT '供应商',
    remark TEXT COMMENT '备注',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-充足，2-预警，3-停止采购',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_grade (grade),
    INDEX idx_moisture_expire (moisture_expire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='制笔原材档案表';

DROP TABLE IF EXISTS production_order;
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '笔型类目ID',
    brush_name VARCHAR(100) NOT NULL COMMENT '毛笔名称',
    brush_spec VARCHAR(200) COMMENT '规格型号',
    craft_type VARCHAR(100) COMMENT '工艺类型',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际生产数量',
    defective_quantity INT DEFAULT 0 COMMENT '废品数量',
    priority TINYINT NOT NULL DEFAULT 2 COMMENT '优先级：1-高，2-中，3-低',
    order_status TINYINT NOT NULL DEFAULT 1 COMMENT '工单状态：1-待开工，2-工艺确认，3-毛料梳理脱脂中，4-笔尖塑形中，5-笔杆修磨中，6-组合嵌装中，7-修锋整笔中，8-待验收，9-已完成，10-已暂停',
    is_craft_confirmed TINYINT DEFAULT 0 COMMENT '工艺是否确认：0-否，1-是',
    craft_confirm_time DATETIME COMMENT '工艺确认时间',
    worker_id BIGINT COMMENT '制笔师傅ID',
    worker_name VARCHAR(50) COMMENT '制笔师傅姓名',
    start_time DATETIME COMMENT '开工时间',
    expect_finish_time DATETIME COMMENT '预计完成时间',
    actual_finish_time DATETIME COMMENT '实际完成时间',
    material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '原料成本',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '手工工时费',
    process_loss_cost DECIMAL(10,2) DEFAULT 0 COMMENT '工艺损耗费用',
    defective_cost DECIMAL(10,2) DEFAULT 0 COMMENT '废品损耗费用',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '综合制作成本',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位制作成本',
    remark TEXT COMMENT '备注',
    is_timeout TINYINT DEFAULT 0 COMMENT '是否超时：0-否，1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_category_id (category_id),
    INDEX idx_order_status (order_status),
    INDEX idx_worker_id (worker_id),
    INDEX idx_expect_finish (expect_finish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='精工制笔生产工单表';

DROP TABLE IF EXISTS material_lock_log;
CREATE TABLE material_lock_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    unlock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已解锁数量',
    lock_type TINYINT NOT NULL COMMENT '锁定类型：1-工单锁定，2-手动锁定',
    lock_status TINYINT NOT NULL DEFAULT 1 COMMENT '锁定状态：1-已锁定，2-已解锁，3-已消耗',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark TEXT COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料锁定记录表';

INSERT INTO material_archive (material_code, material_name, material_type, origin_place, grade, unit, unit_price, stock_quantity, locked_quantity, available_quantity, warning_quantity, status, is_moisture_sensitive, supplier) VALUES
('W001', '狼毫毛料', 1, '浙江湖州', 'A', 'kg', 580.00, 50.00, 0.00, 50.00, 5.00, 1, 1, '湖州笔庄'),
('G001', '羊毫毛料', 1, '浙江湖州', 'A', 'kg', 320.00, 80.00, 0.00, 80.00, 5.00, 1, 1, '湖州笔庄'),
('B001', '竹制笔杆', 2, '安徽泾县', 'B', '根', 15.00, 200.00, 0.00, 200.00, 20.00, 1, 0, '泾县竹业'),
('J001', '天然胶水', 3, '广东江门', 'A', '瓶', 28.00, 100.00, 0.00, 100.00, 10.00, 1, 0, '江门胶业'),
('S001', '装饰流苏', 4, '江苏苏州', 'B', '个', 8.50, 300.00, 0.00, 300.00, 30.00, 1, 0, '苏州饰品厂');

DROP TABLE IF EXISTS order_material;
CREATE TABLE order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
    lock_log_id BIGINT COMMENT '锁定记录ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_order_material (order_id, material_id),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料明细表';

DROP TABLE IF EXISTS order_status_log;
CREATE TABLE order_status_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    from_status TINYINT COMMENT '原状态',
    to_status TINYINT NOT NULL COMMENT '新状态',
    operation_desc VARCHAR(200) COMMENT '操作说明',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单状态流转记录表';

DROP TABLE IF EXISTS cost_revenue_ledger;
CREATE TABLE cost_revenue_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    ledger_no VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
    ledger_date DATE NOT NULL COMMENT '台账日期',
    category_id BIGINT COMMENT '笔型类目ID',
    brush_name VARCHAR(100) COMMENT '毛笔名称',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '原料成本',
    labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '手工工时费',
    process_loss_cost DECIMAL(10,2) DEFAULT 0 COMMENT '工艺损耗费用',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    sales_revenue DECIMAL(10,2) DEFAULT 0 COMMENT '文创营收',
    profit DECIMAL(10,2) DEFAULT 0 COMMENT '利润',
    remark TEXT COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人ID',
    update_by BIGINT COMMENT '更新人ID',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_ledger_date (ledger_date),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='制笔成本营收台账表';

DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    module_name VARCHAR(50) NOT NULL COMMENT '模块名称',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型：新增、修改、删除、查询',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_url VARCHAR(200) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    user_id BIGINT COMMENT '操作人ID',
    user_name VARCHAR(50) COMMENT '操作人姓名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(毫秒)',
    INDEX idx_module_name (module_name),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
