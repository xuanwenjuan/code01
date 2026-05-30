-- 精密数控机床主轴加工管控系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS spindle_manage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE spindle_manage;

-- 用户表
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_username (username),
    KEY idx_status (status),
    KEY idx_real_name (real_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 角色表
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_role_code (role_code),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 权限表
CREATE TABLE sys_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    permission_code VARCHAR(100) NOT NULL COMMENT '权限编码',
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    resource_type VARCHAR(20) COMMENT '资源类型 menu/button',
    resource_path VARCHAR(200) COMMENT '资源路径',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_permission_code (permission_code),
    KEY idx_parent_id (parent_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限表';

-- 用户角色关联表
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    UNIQUE KEY uk_user_role (user_id, role_id),
    KEY idx_user_id (user_id),
    KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE sys_role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    KEY idx_role_id (role_id),
    KEY idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 主轴产品分类表
CREATE TABLE spindle_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_code VARCHAR(50) NOT NULL COMMENT '分类编码',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父级分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0下线 1启用',
    description VARCHAR(500) COMMENT '分类描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_category_code (category_code),
    KEY idx_parent_id (parent_id),
    KEY idx_level (level),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='主轴产品分类表';

-- 原料库存表
CREATE TABLE material_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(50) NOT NULL COMMENT '批次号',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型 合金钢棒/调质圆钢/轴承配件/磨削辅料/防锈油脂',
    specification VARCHAR(200) COMMENT '规格型号',
    quantity DECIMAL(18,4) NOT NULL COMMENT '库存数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(18,4) COMMENT '单价',
    total_value DECIMAL(18,4) COMMENT '总价值',
    inventory_status TINYINT DEFAULT 1 COMMENT '库存状态 0库存预警 1库存充足 2停止采购',
    constant_temp_expire_time DATETIME COMMENT '恒温仓储时效到期时间',
    supplier VARCHAR(200) COMMENT '供应商',
    warehouse_location VARCHAR(100) COMMENT '库位',
    minimum_stock DECIMAL(18,4) DEFAULT 0 COMMENT '最低安全库存',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_batch_no (batch_no),
    KEY idx_material_type (material_type),
    KEY idx_inventory_status (inventory_status),
    KEY idx_material_name (material_name),
    KEY idx_expire_time (constant_temp_expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

-- 生产工单表
CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    category_id BIGINT NOT NULL COMMENT '产品分类ID',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    quantity INT NOT NULL COMMENT '生产数量',
    current_process INT DEFAULT 0 COMMENT '当前工序 0未开始 1切断下料 2粗车外圆 3精车台阶 4磨削成型 5热处理硬化 6精度检测 7轴承装配 8成品入库',
    order_status TINYINT DEFAULT 1 COMMENT '工单状态 1待投产 2生产中 3已暂停 4已完成',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    responsible_person BIGINT COMMENT '负责人',
    material_prepare_status TINYINT DEFAULT 0 COMMENT '备料状态 0未备料 1备料中 2已备料',
    quality_check_status TINYINT DEFAULT 0 COMMENT '质检状态 0未质检 1质检中 2已通过 3已驳回',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_order_status (order_status),
    KEY idx_category_id (category_id),
    KEY idx_create_time (create_time),
    KEY idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单工序记录表
CREATE TABLE order_process_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code INT NOT NULL COMMENT '工序编码',
    process_name VARCHAR(50) NOT NULL COMMENT '工序名称',
    process_status TINYINT DEFAULT 0 COMMENT '工序状态 0未开始 1进行中 2已完成 3质检中 4已返工',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    process_duration BIGINT DEFAULT 0 COMMENT '工序耗时(分钟)',
    quality_result VARCHAR(20) COMMENT '质检结果 PASS/FAIL',
    quality_remark VARCHAR(500) COMMENT '质检备注',
    inspector_id BIGINT COMMENT '质检人ID',
    inspector_name VARCHAR(50) COMMENT '质检人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    KEY idx_order_id (order_id),
    KEY idx_process_code (process_code),
    KEY idx_process_status (process_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序记录表';

-- 成本核算表
CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单号',
    material_cost DECIMAL(18,4) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(18,4) DEFAULT 0 COMMENT '刀具损耗成本',
    machine_cost DECIMAL(18,4) DEFAULT 0 COMMENT '机床能耗成本',
    labor_cost DECIMAL(18,4) DEFAULT 0 COMMENT '人工工时成本',
    scrap_cost DECIMAL(18,4) DEFAULT 0 COMMENT '精度超差报废成本',
    other_cost DECIMAL(18,4) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(18,4) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(18,4) DEFAULT 0 COMMENT '单位成本',
    accounting_status TINYINT DEFAULT 0 COMMENT '核算状态 0未核算 1核算中 2已核算 3已对账',
    accounting_date DATE COMMENT '核算日期',
    accountant_id BIGINT COMMENT '核算人ID',
    accountant_name VARCHAR(50) COMMENT '核算人姓名',
    reconciliation_time DATETIME COMMENT '对账时间',
    reconciliator_id BIGINT COMMENT '对账人ID',
    reconciliator_name VARCHAR(50) COMMENT '对账人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    UNIQUE KEY uk_order_id (order_id),
    KEY idx_order_no (order_no),
    KEY idx_accounting_date (accounting_date),
    KEY idx_accounting_status (accounting_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';

-- 工单用料明细表
CREATE TABLE order_material_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    material_type VARCHAR(50) COMMENT '物料类型',
    quantity DECIMAL(18,4) NOT NULL COMMENT '领用数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(18,4) COMMENT '单价',
    total_price DECIMAL(18,4) COMMENT '总价',
    receive_time DATETIME COMMENT '领用时间',
    receiver_id BIGINT COMMENT '领用人ID',
    receiver_name VARCHAR(50) COMMENT '领用人姓名',
    return_quantity DECIMAL(18,4) DEFAULT 0 COMMENT '退料数量',
    return_time DATETIME COMMENT '退料时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    KEY idx_order_id (order_id),
    KEY idx_material_id (material_id),
    KEY idx_batch_no (batch_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

-- 操作日志表
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(200) COMMENT '操作内容',
    operation_type VARCHAR(50) COMMENT '操作类型 CREATE/UPDATE/DELETE/QUERY/EXPORT',
    business_type VARCHAR(50) COMMENT '业务类型 ORDER/MATERIAL/COST/CATEGORY',
    business_id BIGINT COMMENT '业务ID',
    business_no VARCHAR(50) COMMENT '业务编号',
    method VARCHAR(200) COMMENT '操作方法',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '操作结果',
    ip VARCHAR(50) COMMENT 'IP地址',
    operation_time DATETIME COMMENT '操作时间',
    cost_time BIGINT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态 0失败 1成功',
    error_msg VARCHAR(500) COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    KEY idx_user_id (user_id),
    KEY idx_operation_time (operation_time),
    KEY idx_business_type (business_type),
    KEY idx_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 库存操作记录表
CREATE TABLE inventory_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_no VARCHAR(50) NOT NULL COMMENT '批次号',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型 IN入库/OUT出库/RETURN退料/ADJUST调整',
    quantity DECIMAL(18,4) NOT NULL COMMENT '操作数量',
    before_quantity DECIMAL(18,4) COMMENT '操作前数量',
    after_quantity DECIMAL(18,4) COMMENT '操作后数量',
    order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_material_id (material_id),
    KEY idx_batch_no (batch_no),
    KEY idx_operation_type (operation_type),
    KEY idx_order_id (order_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存操作记录表';

-- 初始化数据
-- 插入默认用户 密码123456
INSERT INTO sys_user (username, password, real_name, phone, email, status) VALUES
('admin', '123456', '系统管理员', '13800138000', 'admin@spindle.com', 1),
('purchaser', '123456', '采购专员', '13800138001', 'purchaser@spindle.com', 1),
('technician', '123456', '机加工工艺员', '13800138002', 'technician@spindle.com', 1),
('leader', '123456', '产线组长', '13800138003', 'leader@spindle.com', 1),
('inspector', '123456', '精度质检员', '13800138004', 'inspector@spindle.com', 1);

-- 插入角色
INSERT INTO sys_role (role_code, role_name, description, status) VALUES
('admin', '系统管理员', '系统最高权限', 1),
('purchaser', '采购专员', '负责原料采购和库存管理', 1),
('technician', '机加工工艺员', '负责生产工艺和工单管理', 1),
('leader', '产线组长', '负责生产进度和人员管理', 1),
('inspector', '精度质检员', '负责产品质量检验', 1);

-- 插入权限
INSERT INTO sys_permission (permission_code, permission_name, resource_type, parent_id, sort, status) VALUES
-- 分类管理权限
('category:query', '查询分类', 'button', 0, 1, 1),
('category:add', '新增分类', 'button', 0, 2, 1),
('category:update', '编辑分类', 'button', 0, 3, 1),
('category:offline', '分类下线', 'button', 0, 4, 1),
-- 原料管理权限
('material:query', '查询物料', 'button', 0, 5, 1),
('material:add', '新增物料', 'button', 0, 6, 1),
('material:update', '编辑物料', 'button', 0, 7, 1),
('material:in', '物料入库', 'button', 0, 8, 1),
('material:out', '物料出库', 'button', 0, 9, 1),
('material:prepare', '工单备料', 'button', 0, 10, 1),
-- 工单管理权限
('order:query', '查询工单', 'button', 0, 11, 1),
('order:create', '创建工单', 'button', 0, 12, 1),
('order:update', '编辑工单', 'button', 0, 13, 1),
('order:process', '工序操作', 'button', 0, 14, 1),
('order:pause', '暂停工单', 'button', 0, 15, 1),
('order:resume', '恢复工单', 'button', 0, 16, 1),
-- 质检权限
('quality:check', '工序质检', 'button', 0, 17, 1),
('quality:final', '成品质检', 'button', 0, 18, 1),
-- 成本核算权限
('cost:query', '查询成本', 'button', 0, 19, 1),
('cost:generate', '生成成本', 'button', 0, 20, 1),
('cost:add', '添加用料', 'button', 0, 21, 1),
('cost:reconciliation', '成本对账', 'button', 0, 22, 1);

-- 插入用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- 插入角色权限关联
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
-- 系统管理员 - 所有权限
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20),
(1, 21), (1, 22),
-- 采购专员 - 物料管理相关
(2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
-- 机加工工艺员 - 分类、工单创建、工序操作
(3, 1), (3, 2), (3, 3), (3, 4), (3, 11), (3, 12), (3, 13), (3, 14),
-- 产线组长 - 工单查询、工序操作、暂停恢复
(4, 11), (4, 14), (4, 15), (4, 16),
-- 精度质检员 - 质检相关
(5, 11), (5, 17), (5, 18);

-- 插入产品分类示例数据
INSERT INTO spindle_category (category_code, category_name, parent_id, level, sort, status, description) VALUES
('HIGH_SPEED', '高速精密主轴', 0, 1, 1, 1, '高速精密系列主轴'),
('CNC_LATHE', '数控车床主轴', 0, 1, 2, 1, '数控车床系列主轴'),
('MACHINING', '加工中心主轴', 0, 1, 3, 1, '加工中心系列主轴'),
('CUSTOM', '定制专用主轴', 0, 1, 4, 1, '客户定制专用主轴'),
('HIGH_SPEED_10000', '10000转高速主轴', 1, 2, 1, 1, '转速10000rpm高速精密主轴'),
('HIGH_SPEED_20000', '20000转高速主轴', 1, 2, 2, 1, '转速20000rpm高速精密主轴'),
('CNC_LATHE_STD', '标准车床主轴', 2, 2, 1, 1, '标准数控车床主轴'),
('CNC_LATHE_HIGH', '高精密车床主轴', 2, 2, 2, 1, '高精密数控车床主轴');
