CREATE DATABASE IF NOT EXISTS flange_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE flange_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(30) NOT NULL COMMENT '角色:PURCHASE_SPECIALIST,PROCESS_ENGINEER,LINE_LEADER,QUALITY_INSPECTOR,ADMIN',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE flange_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    category_type VARCHAR(50) COMMENT '分类类型:FLAT_WELD,BUTT_WELD,BLANK,CUSTOM',
    priority INT DEFAULT 0 COMMENT '排产优先级',
    status TINYINT DEFAULT 1 COMMENT '状态:0下线,1正常',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='法兰分类表';

CREATE TABLE material_storage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) NOT NULL COMMENT '物料类型:CARBON_STEEL,STAINLESS_STEEL,ALLOY,WELDING_MATERIAL,CUTTING_FLUID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    status VARCHAR(20) DEFAULT 'SUFFICIENT' COMMENT '状态:SUFFICIENT,WARNING,STOP_PURCHASE',
    is_rust_prone TINYINT DEFAULT 0 COMMENT '是否易锈蚀:0否,1是',
    rust_remind_date DATE COMMENT '防锈提醒日期',
    location VARCHAR(100) COMMENT '存放位置',
    supplier VARCHAR(100) COMMENT '供应商',
    in_time DATETIME COMMENT '入库时间',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料仓储表';

CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    flange_category_id BIGINT NOT NULL COMMENT '法兰分类ID',
    flange_category_name VARCHAR(100) COMMENT '法兰分类名称',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    required_material DECIMAL(10,2) COMMENT '所需原料数量',
    unit_price DECIMAL(10,2) COMMENT '原料单价',
    quantity INT NOT NULL COMMENT '生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际完成数量',
    rejection_quantity INT DEFAULT 0 COMMENT '报废数量',
    priority INT DEFAULT 0 COMMENT '优先级',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '状态:PENDING,MATERIAL_CONFIRMED,PRODUCING,PAUSED,WAITING_INSPECTION,COMPLETED,CANCELLED',
    process_status VARCHAR(30) DEFAULT 'CUTTING' COMMENT '工序状态:CUTTING,ROUGH_TURNING,FINE_TURNING,MILLING,WELDING,NDT,ANTIRUST,FINISHED',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    is_overdue TINYINT DEFAULT 0 COMMENT '是否超期:0否,1是',
    remark VARCHAR(500) COMMENT '备注',
    create_by BIGINT COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_status (status),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE production_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_step VARCHAR(30) NOT NULL COMMENT '工序步骤',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_type VARCHAR(30) NOT NULL COMMENT '操作类型:START,COMPLETE,PAUSE,RESUME,CHECK',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    quantity INT COMMENT '操作数量',
    qualified_quantity INT COMMENT '合格数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产操作日志表';

CREATE TABLE cost_accounting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '核算ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_quantity DECIMAL(10,2) COMMENT '原料数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(12,2) DEFAULT 0 COMMENT '刀具损耗成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '机床能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    labor_hours DECIMAL(8,2) DEFAULT 0 COMMENT '人工工时',
    machine_hours DECIMAL(8,2) DEFAULT 0 COMMENT '机加工时',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态:DRAFT,CONFIRMED',
    confirm_by BIGINT COMMENT '确认人',
    confirm_time DATETIME COMMENT '确认时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本核算表';

CREATE TABLE material_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    usage_quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总价',
    operator_id BIGINT COMMENT '操作人',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料明细表';

CREATE TABLE inventory_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_no VARCHAR(50) COMMENT '批次号',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型:IN,OUT,ADJUST',
    before_quantity DECIMAL(10,2) COMMENT '操作前数量',
    operation_quantity DECIMAL(10,2) NOT NULL COMMENT '操作数量',
    after_quantity DECIMAL(10,2) COMMENT '操作后数量',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    related_order_id BIGINT COMMENT '关联工单ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_material_id (material_id),
    INDEX idx_operation_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存出入库记录表';

CREATE TABLE inventory_check (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '盘点ID',
    check_no VARCHAR(50) NOT NULL UNIQUE COMMENT '盘点单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    system_quantity DECIMAL(10,2) COMMENT '系统库存数量',
    actual_quantity DECIMAL(10,2) NOT NULL COMMENT '实际盘点数量',
    diff_quantity DECIMAL(10,2) COMMENT '差异数量',
    diff_reason VARCHAR(500) COMMENT '差异原因',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态:PENDING,APPROVED,REJECTED',
    approver_id BIGINT COMMENT '审批人ID',
    approver_name VARCHAR(50) COMMENT '审批人姓名',
    approve_time DATETIME COMMENT '审批时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_check_no (check_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存盘点表';

CREATE TABLE material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '锁定ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    lock_type VARCHAR(20) COMMENT '锁定类型:ORDER,ADJUST',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态:ACTIVE,RELEASED,USED',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    expire_time DATETIME COMMENT '过期时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_material_id (material_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料锁定表';

CREATE TABLE production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '损耗ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_step VARCHAR(30) COMMENT '工序步骤',
    loss_type VARCHAR(20) COMMENT '损耗类型:TOOL,SCRAP,MATERIAL',
    loss_quantity DECIMAL(10,2) COMMENT '损耗数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(12,2) COMMENT '总金额',
    loss_reason VARCHAR(500) COMMENT '损耗原因',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_id (order_id),
    INDEX idx_loss_type (loss_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗记录表';

CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '质检ID',
    inspection_no VARCHAR(50) NOT NULL UNIQUE COMMENT '质检单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    inspection_type VARCHAR(20) COMMENT '质检类型:FINAL,PROCESS',
    inspected_quantity INT COMMENT '抽检数量',
    passed_quantity INT COMMENT '合格数量',
    defect_quantity INT COMMENT '不良数量',
    defect_rate DECIMAL(8,4) COMMENT '不良率',
    defect_description VARCHAR(500) COMMENT '不良描述',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态:PENDING,APPROVED,REJECTED',
    inspector_id BIGINT COMMENT '质检员ID',
    inspector_name VARCHAR(50) COMMENT '质检员姓名',
    approval_result VARCHAR(20) COMMENT '审批结果:PASS,REWORK,REJECT',
    approval_remark VARCHAR(500) COMMENT '审批备注',
    approver_id BIGINT COMMENT '审批人ID',
    approver_name VARCHAR(50) COMMENT '审批人姓名',
    approval_time DATETIME COMMENT '审批时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_inspection_no (inspection_no),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验表';

CREATE TABLE work_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工时ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单编号',
    process_step VARCHAR(30) COMMENT '工序步骤',
    labor_hours DECIMAL(8,2) DEFAULT 0 COMMENT '人工工时',
    machine_hours DECIMAL(8,2) DEFAULT 0 COMMENT '机加工时',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工时记录表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '13800000000', 'ADMIN', 1),
('purchase01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张三', '13800000001', 'PURCHASE_SPECIALIST', 1),
('process01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '李四', '13800000002', 'PROCESS_ENGINEER', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '王五', '13800000003', 'LINE_LEADER', 1),
('quality01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '赵六', '13800000004', 'QUALITY_INSPECTOR', 1);

INSERT INTO flange_category (parent_id, category_name, category_code, category_type, priority, status) VALUES
(0, '平焊法兰', 'FLAT_WELD', 'FLAT_WELD', 1, 1),
(0, '对焊法兰', 'BUTT_WELD', 'BUTT_WELD', 2, 1),
(0, '盲板法兰', 'BLANK', 'BLANK', 3, 1),
(0, '定制精密法兰', 'CUSTOM', 'CUSTOM', 4, 1),
(1, '板式平焊法兰', 'PLATE_FLAT', 'FLAT_WELD', 1, 1),
(1, '带颈平焊法兰', 'NECK_FLAT', 'FLAT_WELD', 2, 1),
(2, '对焊法兰DN100', 'BUTT_DN100', 'BUTT_WELD', 1, 1),
(2, '对焊法兰DN200', 'BUTT_DN200', 'BUTT_WELD', 2, 1);
