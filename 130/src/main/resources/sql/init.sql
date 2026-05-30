CREATE DATABASE IF NOT EXISTS embedded_metal DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE embedded_metal;

DROP TABLE IF EXISTS sys_user_role;
DROP TABLE IF EXISTS sys_role;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS production_log;
DROP TABLE IF EXISTS cost_accounting;
DROP TABLE IF EXISTS order_material_detail;
DROP TABLE IF EXISTS production_order;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS product_category;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES sys_user(id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    category_type VARCHAR(50) COMMENT '分类类型：地脚螺栓、预埋钢板、穿墙套管、锚固连接件等',
    sort_order INT DEFAULT 0 COMMENT '排序字段，数值越小越靠前',
    priority INT DEFAULT 0 COMMENT '施工订单优先级',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下线停产，1-正常生产',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品类目表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '原料类型：圆钢型材、热轧钢板、镀锌坯料、防锈处理辅料',
    specification VARCHAR(200) NOT NULL COMMENT '规格型号',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '计量单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    storage_location VARCHAR(200) COMMENT '存放位置',
    is_humid_env TINYINT DEFAULT 0 COMMENT '是否潮湿环境：0-否，1-是',
    rust_warning_days INT DEFAULT 7 COMMENT '锈蚀预警天数',
    in_date DATE COMMENT '入库日期',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：NORMAL-库存充足，WARNING-库存预警，STOP-停止采购',
    rust_warning_status TINYINT DEFAULT 0 COMMENT '锈蚀预警状态：0-正常，1-预警',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='金属型材原料表';

CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '产品类目ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    specification VARCHAR(200) COMMENT '产品规格',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际生产数量',
    defective_quantity INT DEFAULT 0 COMMENT '不合格品数量',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待投产，CUTTING-裁切中，FORMING-折弯成型中，THREADING-螺纹加工中，COATING-表面防腐中，INSPECTING-尺寸复检中，PACKING-打包中，FINISHED-已完成，SUSPENDED-已暂停',
    plan_start_time DATETIME COMMENT '计划开始时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    finish_time DATETIME COMMENT '完成时间',
    timeout_hours INT DEFAULT 24 COMMENT '超期未投产时间（小时）',
    is_timeout_suspended TINYINT DEFAULT 0 COMMENT '是否超期暂停：0-否，1-是',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    FOREIGN KEY (category_id) REFERENCES product_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE order_material_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    specification VARCHAR(200) COMMENT '原料规格',
    used_quantity DECIMAL(10,2) NOT NULL COMMENT '使用数量',
    waste_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES production_order(id),
    FOREIGN KEY (material_id) REFERENCES material(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '核算ID',
    accounting_no VARCHAR(50) NOT NULL UNIQUE COMMENT '核算单号',
    category_id BIGINT COMMENT '产品类目ID',
    accounting_month VARCHAR(7) NOT NULL COMMENT '核算月份：YYYY-MM',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '型材原料成本',
    equipment_loss DECIMAL(12,2) DEFAULT 0 COMMENT '设备加工损耗',
    coating_cost DECIMAL(12,2) DEFAULT 0 COMMENT '防腐处理开销',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    scrap_loss DECIMAL(12,2) DEFAULT 0 COMMENT '不合格品报废损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿，CONFIRMED-已确认',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (category_id) REFERENCES product_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';

CREATE TABLE production_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT COMMENT '工单ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_content TEXT COMMENT '操作内容',
    before_status VARCHAR(20) COMMENT '操作前状态',
    after_status VARCHAR(20) COMMENT '操作后状态',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产操作日志表';

INSERT INTO sys_role (role_code, role_name, description) VALUES
('PURCHASER', '原料采购员', '负责原料采购管理'),
('TECHNICIAN', '工艺技术员', '负责工艺技术管理'),
('TEAM_LEADER', '产线组长', '负责产线生产管理'),
('INSPECTOR', '质量抽检员', '负责产品质量抽检'),
('ADMIN', '系统管理员', '系统管理员');

INSERT INTO sys_user (username, password, real_name, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '13800138000'),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张三', '13800138001'),
('tech01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '李四', '13800138002'),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '王五', '13800138003'),
('inspector01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '赵六', '13800138004');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 5),
(2, 1),
(3, 2),
(4, 3),
(5, 4);

INSERT INTO product_category (parent_id, category_name, category_code, category_type, sort_order, priority) VALUES
(0, '建筑地脚螺栓', 'ANCHOR_BOLT', '地脚螺栓', 1, 10),
(0, '预埋钢板', 'EMBEDDED_PLATE', '预埋钢板', 2, 8),
(0, '穿墙套管', 'WALL_CASING', '穿墙套管', 3, 6),
(0, '锚固连接件', 'ANCHOR_CONNECTOR', '锚固连接件', 4, 5),
(1, 'L型地脚螺栓', 'L_TYPE_BOLT', '地脚螺栓', 1, 10),
(1, 'J型地脚螺栓', 'J_TYPE_BOLT', '地脚螺栓', 2, 9),
(1, 'U型地脚螺栓', 'U_TYPE_BOLT', '地脚螺栓', 3, 8),
(2, '普通预埋钢板', 'NORMAL_PLATE', '预埋钢板', 1, 8),
(2, '带肋预埋钢板', 'RIBBED_PLATE', '预埋钢板', 2, 7);
