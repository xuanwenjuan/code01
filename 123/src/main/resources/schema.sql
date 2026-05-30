CREATE DATABASE IF NOT EXISTS stamping_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stamping_production;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    status INT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(200) COMMENT '描述',
    status INT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) COMMENT '类目编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '优先级',
    status INT DEFAULT 1 COMMENT '状态 1-启用 0-停产',
    remark VARCHAR(500) COMMENT '备注',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品类目表';

CREATE TABLE IF NOT EXISTS material_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_code VARCHAR(100) NOT NULL UNIQUE COMMENT '批次编码',
    material_type VARCHAR(50) NOT NULL COMMENT '材质类型',
    specification VARCHAR(100) NOT NULL COMMENT '规格型号',
    thickness DECIMAL(10,4) NOT NULL COMMENT '厚度',
    quantity DECIMAL(15,4) NOT NULL COMMENT '数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    unit_price DECIMAL(15,4) COMMENT '单价',
    total_price DECIMAL(15,4) COMMENT '总价',
    stock_status INT DEFAULT 1 COMMENT '库存状态 0-无库存 1-充足 2-预警 3-过期',
    is_oxidizable INT DEFAULT 0 COMMENT '是否易氧化 0-否 1-是',
    storage_days INT COMMENT '仓储天数',
    production_date DATE COMMENT '生产日期',
    expiration_date DATE COMMENT '过期日期',
    supplier VARCHAR(100) COMMENT '供应商',
    warehouse_location VARCHAR(100) COMMENT '仓库位置',
    remark VARCHAR(500) COMMENT '备注',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '产品类目ID',
    category_name VARCHAR(100) COMMENT '产品类目名称',
    quantity DECIMAL(15,4) NOT NULL COMMENT '生产数量',
    material_id BIGINT COMMENT '原料ID',
    material_batch_code VARCHAR(100) COMMENT '原料批次编码',
    mold_no VARCHAR(50) COMMENT '模具编号',
    machine_no VARCHAR(50) COMMENT '机器编号',
    status INT DEFAULT 1 COMMENT '工单状态 1-待投产 2-生产中 3-裁剪完成 4-模具调试完成 5-冲压完成 6-去毛刺完成 7-质检完成 8-已入库 9-超时',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    production_hours DECIMAL(10,2) COMMENT '生产工时',
    qualified_quantity DECIMAL(15,4) DEFAULT 0 COMMENT '合格数量',
    scrap_quantity DECIMAL(15,4) DEFAULT 0 COMMENT '报废数量',
    operator VARCHAR(50) COMMENT '操作员',
    technician VARCHAR(50) COMMENT '技术员',
    remark VARCHAR(500) COMMENT '备注',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE IF NOT EXISTS cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    accounting_date DATE NOT NULL COMMENT '统计日期',
    category_id BIGINT COMMENT '产品类目ID',
    category_name VARCHAR(100) COMMENT '产品类目名称',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    material_cost DECIMAL(15,4) DEFAULT 0 COMMENT '原料成本',
    material_loss_cost DECIMAL(15,4) DEFAULT 0 COMMENT '原料损耗成本',
    mold_wear_cost DECIMAL(15,4) DEFAULT 0 COMMENT '模具磨损成本',
    labor_cost DECIMAL(15,4) DEFAULT 0 COMMENT '人工成本',
    outsourcing_cost DECIMAL(15,4) DEFAULT 0 COMMENT '外协加工支出',
    other_cost DECIMAL(15,4) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(15,4) DEFAULT 0 COMMENT '总成本',
    production_quantity DECIMAL(15,4) COMMENT '生产数量',
    unit_cost DECIMAL(15,4) COMMENT '单位成本',
    revenue DECIMAL(15,4) COMMENT '营收',
    profit DECIMAL(15,4) COMMENT '利润',
    profit_margin DECIMAL(10,4) COMMENT '利润率(%)',
    remark VARCHAR(500) COMMENT '备注',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(200) COMMENT '操作',
    method VARCHAR(200) COMMENT '方法名',
    params TEXT COMMENT '参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    duration BIGINT COMMENT '耗时(ms)',
    result VARCHAR(50) COMMENT '结果',
    deleted INT DEFAULT 0 COMMENT '逻辑删除 1-删除 0-未删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_role (role_name, role_code, description, status) VALUES 
('原料采购员', 'PURCHASER', '负责原料采购和库存管理', 1),
('车间技术员', 'TECHNICIAN', '负责模具调试和技术支持', 1),
('生产班组长', 'FOREMAN', '负责生产工单安排和管理', 1),
('财务管理员', 'FINANCE', '负责成本核算和财务管理', 1),
('系统管理员', 'ADMIN', '系统管理员', 1);

INSERT INTO sys_user (username, password, real_name, phone, email, role_id, status) VALUES 
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800138000', 'admin@example.com', 5, 1),
('purchaser01', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138001', 'purchaser01@example.com', 1, 1),
('tech01', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800138002', 'tech01@example.com', 2, 1),
('foreman01', 'e10adc3949ba59abbe56e057f20f883e', '王五', '13800138003', 'foreman01@example.com', 3, 1),
('finance01', 'e10adc3949ba59abbe56e057f20f883e', '赵六', '13800138004', 'finance01@example.com', 4, 1);

INSERT INTO product_category (category_name, category_code, parent_id, level, sort, priority, status) VALUES 
('电子紧固配件', 'ELECTRONIC_FASTENER', 0, 1, 1, 10, 1),
('机械连接垫片', 'MECHANICAL_GASKET', 0, 1, 2, 8, 1),
('五金卡扣件', 'HARDWARE_CLIP', 0, 1, 3, 9, 1),
('非标定制冲压件', 'CUSTOM_STAMPING', 0, 1, 4, 7, 1),
('手机螺丝', 'PHONE_SCREW', 1, 2, 1, 10, 1),
('电脑螺母', 'PC_NUT', 1, 2, 2, 9, 1),
('不锈钢垫片', 'STAINLESS_GASKET', 2, 2, 1, 8, 1),
('铜质垫片', 'COPPER_GASKET', 2, 2, 2, 7, 1),
('塑料卡扣', 'PLASTIC_CLIP', 3, 2, 1, 9, 1),
('金属卡扣', 'METAL_CLIP', 3, 2, 2, 8, 1),
('汽车冲压件', 'AUTO_STAMPING', 4, 2, 1, 7, 1),
('航空冲压件', 'AERO_STAMPING', 4, 2, 2, 6, 1);
