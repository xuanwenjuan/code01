CREATE DATABASE IF NOT EXISTS motor_core DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE motor_core;

-- 用户表
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 角色表
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 用户角色关联表
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 铁芯产品类目表
CREATE TABLE core_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类目ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父类目ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) UNIQUE COMMENT '类目编码',
    category_type VARCHAR(50) COMMENT '类目类型:风机电机铁芯/水泵电机铁芯/家电马达铁芯/工业伺服铁芯',
    sort_order INT DEFAULT 0 COMMENT '排序优先级',
    status TINYINT DEFAULT 1 COMMENT '状态 0下架 1上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铁芯产品类目表';

-- 硅钢片物料表
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) COMMENT '物料类型:无取向硅钢卷/取向硅钢卷/绝缘涂层辅料',
    specification VARCHAR(200) COMMENT '规格牌号',
    thickness DECIMAL(10,4) COMMENT '厚度(mm)',
    width DECIMAL(10,2) COMMENT '宽度(mm)',
    weight DECIMAL(10,2) COMMENT '重量(kg)',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    stock_status TINYINT DEFAULT 1 COMMENT '库存状态 1充足 2预警 3停止采购',
    storage_location VARCHAR(100) COMMENT '存放位置',
    production_date DATE COMMENT '生产日期',
    shelf_life_days INT COMMENT '保质期(天)',
    supplier VARCHAR(100) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='硅钢片物料表';

-- 生产工单表
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '产品类目ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    plan_quantity INT NOT NULL COMMENT '计划数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际数量',
    material_id BIGINT COMMENT '使用物料ID',
    material_usage DECIMAL(10,2) COMMENT '物料用量',
    status TINYINT DEFAULT 1 COMMENT '工单状态 1待排产 2已排产 3开平分条中 4裁切中 5叠压成型中 6端面打磨中 7绝缘喷涂中 8已完成 9已搁置',
    priority TINYINT DEFAULT 1 COMMENT '优先级 1普通 2紧急 3特急',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    process_leader_id BIGINT COMMENT '生产组长ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单工序记录表
CREATE TABLE order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称:开平分条/精准裁切/叠压成型/端面打磨/绝缘喷涂/成品入库',
    operator_id BIGINT COMMENT '操作人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    process_duration INT COMMENT '加工时长(分钟)',
    output_quantity INT COMMENT '产出数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良品数量',
    status TINYINT DEFAULT 1 COMMENT '状态 1进行中 2已完成',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序记录表';

-- 生产能耗成本台账表
CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
    cost_date DATE NOT NULL COMMENT '统计日期',
    category_id BIGINT NOT NULL COMMENT '产品类目ID',
    order_id BIGINT COMMENT '工单ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    material_waste DECIMAL(10,2) DEFAULT 0 COMMENT '原料损耗(kg)',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '用电能耗成本',
    energy_consumption DECIMAL(10,2) DEFAULT 0 COMMENT '耗电量(kWh)',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    labor_hours DECIMAL(10,2) DEFAULT 0 COMMENT '人工工时',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良品报废成本',
    defective_quantity INT DEFAULT 0 COMMENT '不良品数量',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    sale_price DECIMAL(12,2) DEFAULT 0 COMMENT '销售单价',
    profit DECIMAL(12,2) DEFAULT 0 COMMENT '利润',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产能耗成本台账表';

-- 工单用料明细表
CREATE TABLE order_material_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_code VARCHAR(50) COMMENT '批次编码',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    unit_price DECIMAL(12,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    operator_id BIGINT COMMENT '操作人ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

-- 生产操作日志表
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    module VARCHAR(50) COMMENT '模块名称',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    business_id BIGINT COMMENT '业务ID',
    business_no VARCHAR(50) COMMENT '业务编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_params TEXT COMMENT '请求参数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产操作日志表';

-- 初始化角色数据
INSERT INTO sys_role (role_code, role_name, description) VALUES
('PURCHASE', '物料采购', '负责物料采购和库存管理'),
('PROCESS_ENGINEER', '工艺工程师', '负责工艺流程和技术支持'),
('PRODUCTION_LEADER', '生产组长', '负责生产安排和现场管理'),
('QUALITY_SUPERVISOR', '质检主管', '负责质量检验和品质管理');

-- 初始化管理员用户
INSERT INTO sys_user (username, password, real_name, phone, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVE', '管理员', '13800138000', 1);

-- 初始化类目数据
INSERT INTO core_category (parent_id, category_name, category_code, category_type, sort_order, status) VALUES
(0, '风机电机铁芯', 'FAN', '风机电机铁芯', 1, 1),
(0, '水泵电机铁芯', 'PUMP', '水泵电机铁芯', 2, 1),
(0, '家电马达铁芯', 'APPLIANCE', '家电马达铁芯', 3, 1),
(0, '工业伺服铁芯', 'SERVO', '工业伺服铁芯', 4, 1);
