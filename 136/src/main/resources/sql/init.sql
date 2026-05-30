CREATE DATABASE IF NOT EXISTS radiator_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE radiator_db;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    status INT DEFAULT 1 COMMENT '状态 1正常 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE radiator_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    category_type VARCHAR(50) COMMENT '分类类型',
    priority INT DEFAULT 0 COMMENT '优先级',
    status INT DEFAULT 1 COMMENT '状态 1正常 0下线',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_parent_id(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='散热器品类表';

CREATE TABLE material_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_code VARCHAR(50) UNIQUE COMMENT '物料编码',
    batch_no VARCHAR(100) UNIQUE COMMENT '批次编号',
    material_type VARCHAR(50) COMMENT '物料类型',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态 NORMAL充足 WARNING预警 STOP停止采购',
    is_moisture_proof TINYINT DEFAULT 0 COMMENT '是否防潮配件 0否 1是',
    storage_reminder TEXT COMMENT '仓储存放提醒',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_material_code(material_code),
    INDEX idx_material_name(material_name),
    INDEX idx_material_type(material_type),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铝材配件库存表';

CREATE TABLE material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '锁定ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    lock_type VARCHAR(50) COMMENT '锁定类型',
    status VARCHAR(20) DEFAULT 'LOCKED' COMMENT '状态 LOCKED锁定 UNLOCKED解锁 CONSUMED消耗',
    lock_user_id BIGINT COMMENT '锁定人ID',
    lock_user_name VARCHAR(50) COMMENT '锁定人姓名',
    lock_time DATETIME COMMENT '锁定时间',
    unlock_user_id BIGINT COMMENT '解锁人ID',
    unlock_user_name VARCHAR(50) COMMENT '解锁人姓名',
    unlock_time DATETIME COMMENT '解锁时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id),
    INDEX idx_material_id(material_id),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料锁定表';

CREATE TABLE production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '损耗ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    loss_type VARCHAR(50) COMMENT '损耗类型：MATERIAL物料损耗 MACHINE机器损耗 LABOR人工损耗',
    loss_quantity DECIMAL(10,2) NOT NULL COMMENT '损耗数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    loss_reason TEXT COMMENT '损耗原因',
    responsible_person VARCHAR(50) COMMENT '责任人',
    is_charged TINYINT DEFAULT 0 COMMENT '是否已计入成本 0否 1是',
    remark TEXT COMMENT '备注',
    report_user_id BIGINT COMMENT '报损人ID',
    report_user_name VARCHAR(50) COMMENT '报损人姓名',
    report_time DATETIME COMMENT '报损时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id),
    INDEX idx_material_id(material_id),
    INDEX idx_loss_type(loss_type),
    INDEX idx_is_charged(is_charged)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗表';

CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单编号',
    radiator_category_id BIGINT COMMENT '散热器品类ID',
    quantity INT NOT NULL COMMENT '生产数量',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 PENDING待排产 CUTTING裁切 STAMPING冲压 PIPING管路 ASSEMBLING组装 LEAK_TESTING检漏 PACKAGING打包 COMPLETED完成 PAUSED暂停 CANCELLED取消',
    current_process VARCHAR(50) COMMENT '当前工序',
    leader_id BIGINT COMMENT '产线组长ID',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_status(status),
    INDEX idx_plan_start_date(plan_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料明细表';

CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成本ID',
    work_order_id BIGINT COMMENT '工单ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '物料成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备损耗',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    consumable_cost DECIMAL(12,2) DEFAULT 0 COMMENT '检漏耗材成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良品报废损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    month VARCHAR(20) COMMENT '统计月份 yyyy-MM',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_month(month),
    INDEX idx_work_order_id(work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

CREATE TABLE monthly_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报表ID',
    report_month VARCHAR(20) UNIQUE NOT NULL COMMENT '报表月份 yyyy-MM',
    total_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总物料成本',
    total_equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总设备损耗',
    total_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总人工成本',
    total_consumable_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总耗材成本',
    total_scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总报废损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    total_production INT DEFAULT 0 COMMENT '总产量',
    total_defective INT DEFAULT 0 COMMENT '不良品数量',
    status INT DEFAULT 0 COMMENT '状态 0未确认 1已确认',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度生产报表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    operation VARCHAR(100) COMMENT '操作内容',
    module VARCHAR(50) COMMENT '模块',
    ip VARCHAR(50) COMMENT 'IP地址',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_create_time(create_time),
    INDEX idx_user_id(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000', 'admin', 1),
('purchase01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张采购', '13800138001', 'purchase_officer', 1),
('assembly01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李工艺', '13800138002', 'assembly_technician', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王组长', '13800138003', 'production_leader', 1),
('quality01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵质检', '13800138004', 'quality_inspector', 1);

CREATE TABLE product_bom (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'BOM ID',
    category_id BIGINT COMMENT '产品分类ID',
    bom_code VARCHAR(50) UNIQUE COMMENT 'BOM编码',
    bom_name VARCHAR(100) COMMENT 'BOM名称',
    version VARCHAR(20) COMMENT '版本号',
    standard_labor_hours DECIMAL(10,2) COMMENT '标准工时',
    standard_labor_cost DECIMAL(10,2) COMMENT '标准人工成本',
    standard_equipment_cost DECIMAL(10,2) COMMENT '标准设备成本',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_category_id(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品BOM表';

CREATE TABLE product_bom_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    bom_id BIGINT NOT NULL COMMENT 'BOM ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    sort_order INT COMMENT '排序',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_bom_id(bom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM明细表';

CREATE TABLE warehouse (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '仓库ID',
    warehouse_code VARCHAR(50) UNIQUE COMMENT '仓库编码',
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    warehouse_type VARCHAR(50) COMMENT '仓库类型',
    address VARCHAR(200) COMMENT '地址',
    manager VARCHAR(50) COMMENT '负责人',
    phone VARCHAR(20) COMMENT '联系电话',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

CREATE TABLE warehouse_location (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库位ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    location_code VARCHAR(50) UNIQUE COMMENT '库位编码',
    location_name VARCHAR(100) COMMENT '库位名称',
    location_type VARCHAR(50) COMMENT '库位类型',
    area VARCHAR(50) COMMENT '区域',
    max_capacity DECIMAL(10,2) COMMENT '最大容量',
    status INT DEFAULT 1 COMMENT '状态 1可用 0占用',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_warehouse_id(warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库位表';

CREATE TABLE stock_in_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '入库单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '入库单号',
    order_type VARCHAR(50) COMMENT '入库类型',
    warehouse_id BIGINT COMMENT '仓库ID',
    location_id BIGINT COMMENT '库位ID',
    supplier_id BIGINT COMMENT '供应商ID',
    supplier_name VARCHAR(100) COMMENT '供应商名称',
    plan_date DATE COMMENT '计划入库日期',
    actual_date DATETIME COMMENT '实际入库日期',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态 DRAFT草稿 PENDING待审核 COMPLETED已完成 REJECTED已拒绝',
    approver_id BIGINT COMMENT '审核人ID',
    approve_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_status(status),
    INDEX idx_warehouse_id(warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单表';

CREATE TABLE stock_in_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '入库单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    batch_no VARCHAR(100) COMMENT '批次号',
    production_date DATETIME COMMENT '生产日期',
    expire_date DATETIME COMMENT '有效期至',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_order_id(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库明细表';

CREATE TABLE stock_out_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '出库单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '出库单号',
    order_type VARCHAR(50) COMMENT '出库类型',
    warehouse_id BIGINT COMMENT '仓库ID',
    location_id BIGINT COMMENT '库位ID',
    work_order_id BIGINT COMMENT '生产工单ID',
    work_order_no VARCHAR(50) COMMENT '生产工单号',
    plan_date DATE COMMENT '计划出库日期',
    actual_date DATETIME COMMENT '实际出库日期',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态 DRAFT草稿 PENDING待审核 COMPLETED已完成 REJECTED已拒绝',
    approver_id BIGINT COMMENT '审核人ID',
    approve_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_status(status),
    INDEX idx_work_order_id(work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库单表';

CREATE TABLE stock_out_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '出库单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_price DECIMAL(10,2) COMMENT '总价',
    batch_no VARCHAR(100) COMMENT '批次号',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_order_id(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库明细表';

CREATE TABLE production_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报工ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    process_code VARCHAR(50) COMMENT '工序编码',
    process_name VARCHAR(100) COMMENT '工序名称',
    report_quantity INT DEFAULT 0 COMMENT '报工数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良数量',
    labor_hours DECIMAL(10,2) COMMENT '工时',
    labor_cost DECIMAL(10,2) COMMENT '人工成本',
    equipment_hours DECIMAL(10,2) COMMENT '设备工时',
    equipment_cost DECIMAL(10,2) COMMENT '设备成本',
    defect_reason TEXT COMMENT '不良原因',
    remark TEXT COMMENT '备注',
    create_by BIGINT COMMENT '报工人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产报工表';

CREATE TABLE quality_inspection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '质检ID',
    inspection_no VARCHAR(50) UNIQUE NOT NULL COMMENT '质检单号',
    inspection_type VARCHAR(50) COMMENT '质检类型',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    category_id BIGINT COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品分类名称',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    sample_quantity INT DEFAULT 0 COMMENT '抽检数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    unqualified_quantity INT DEFAULT 0 COMMENT '不合格数量',
    inspection_result VARCHAR(20) COMMENT '检验结果 PASS合格 FAIL不合格',
    remark TEXT COMMENT '备注',
    inspector_id BIGINT COMMENT '检验员ID',
    inspector_name VARCHAR(50) COMMENT '检验员姓名',
    inspection_time DATETIME COMMENT '检验时间',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 PENDING待检验 COMPLETED已检验',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验表';

CREATE TABLE quality_inspection_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    inspection_id BIGINT NOT NULL COMMENT '质检ID',
    inspection_item VARCHAR(100) COMMENT '检验项目',
    standard_value VARCHAR(200) COMMENT '标准值',
    actual_value VARCHAR(200) COMMENT '实际值',
    inspection_result VARCHAR(20) COMMENT '检验结果',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_inspection_id(inspection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验明细表';

CREATE TABLE stock_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '盘点ID',
    inventory_no VARCHAR(50) UNIQUE NOT NULL COMMENT '盘点单号',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    location_id BIGINT COMMENT '库位ID',
    location_name VARCHAR(100) COMMENT '库位名称',
    inventory_type VARCHAR(50) COMMENT '盘点类型',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态 DRAFT草稿 PENDING待审核 COMPLETED已完成 REJECTED已拒绝',
    total_items INT DEFAULT 0 COMMENT '总项数',
    discrepancy_items INT DEFAULT 0 COMMENT '差异项数',
    remark TEXT COMMENT '备注',
    approver_id BIGINT COMMENT '审核人ID',
    approve_time DATETIME COMMENT '审核时间',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_status(status),
    INDEX idx_warehouse_id(warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存盘点表';

CREATE TABLE stock_inventory_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    inventory_id BIGINT NOT NULL COMMENT '盘点ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    batch_no VARCHAR(100) COMMENT '批次号',
    system_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '系统数量',
    actual_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际数量',
    difference_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '差异数量',
    difference_reason TEXT COMMENT '差异原因',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_inventory_id(inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存盘点明细表';

CREATE TABLE finished_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成品库存ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    category_id BIGINT COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品分类名称',
    product_code VARCHAR(50) COMMENT '产品编码',
    product_name VARCHAR(100) COMMENT '产品名称',
    specification VARCHAR(200) COMMENT '规格型号',
    quantity INT DEFAULT 0 COMMENT '数量',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    location_id BIGINT COMMENT '库位ID',
    location_name VARCHAR(100) COMMENT '库位名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    unit_cost DECIMAL(10,2) COMMENT '单位成本',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    quality_level VARCHAR(20) COMMENT '质量等级',
    remark TEXT COMMENT '备注',
    inspector_id BIGINT COMMENT '检验员ID',
    storage_time DATETIME COMMENT '入库时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted INT DEFAULT 0 COMMENT '是否删除 0否 1是',
    INDEX idx_work_order_id(work_order_id),
    INDEX idx_category_id(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品库存表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '管理员', '13800138000', 'admin', 1),
('purchase01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张采购', '13800138001', 'purchase_officer', 1),
('assembly01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李工艺', '13800138002', 'assembly_technician', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王组长', '13800138003', 'production_leader', 1),
('quality01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵质检', '13800138004', 'quality_inspector', 1),
('warehouse01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '刘仓管', '13800138005', 'warehouse_manager', 1);

INSERT INTO radiator_category (parent_id, category_name, category_code, category_type, priority, status) VALUES
(0, '轿车水箱散热器', 'CAR_RADIATOR', 'CAR', 10, 1),
(0, '货车散热总成', 'TRUCK_RADIATOR', 'TRUCK', 20, 1),
(0, '工程机械散热件', 'ENGINEERING_RADIATOR', 'ENGINEERING', 30, 1),
(0, '定制异形散热器', 'CUSTOM_RADIATOR', 'CUSTOM', 40, 1),
(1, '经济型轿车散热器', 'CAR_ECONOMY', 'CAR', 11, 1),
(1, '豪华型轿车散热器', 'CAR_LUXURY', 'CAR', 12, 1),
(2, '重型货车散热器', 'TRUCK_HEAVY', 'TRUCK', 21, 1),
(2, '轻型货车散热器', 'TRUCK_LIGHT', 'TRUCK', 22, 1);

INSERT INTO warehouse (warehouse_code, warehouse_name, warehouse_type, address, manager, phone, status) VALUES
('WH001', '原材料仓库', 'RAW_MATERIAL', '厂区A栋1楼', '刘仓管', '13800138005', 1),
('WH002', '成品仓库', 'FINISHED_GOODS', '厂区B栋1楼', '刘仓管', '13800138005', 1);

INSERT INTO warehouse_location (warehouse_id, location_code, location_name, location_type, area, max_capacity, status) VALUES
(1, 'LOC-A001', 'A区001位', 'STORAGE', 'A区', 1000, 1),
(1, 'LOC-A002', 'A区002位', 'STORAGE', 'A区', 1000, 1),
(2, 'LOC-B001', 'B区001位', 'STORAGE', 'B区', 2000, 1);

INSERT INTO material_inventory (material_name, material_code, batch_no, material_type, specification, unit, quantity, warning_quantity, unit_price, status, is_moisture_proof) VALUES
('铝散热板', 'AL-001', 'BATCH-202401001', 'ALUMINUM', '300*200*2mm', '片', 500, 100, 85.50, 'NORMAL', 0),
('散热铜管', 'COPPER-001', 'BATCH-202401002', 'COPPER', 'φ8*0.5*500mm', '根', 1000, 200, 12.80, 'NORMAL', 0),
('密封胶圈', 'SEAL-001', 'BATCH-202401003', 'SEAL', 'φ300', '个', 2000, 500, 2.50, 'NORMAL', 1),
('固定支架', 'BRACKET-001', 'BATCH-202401004', 'BRACKET', '不锈钢', '套', 800, 200, 15.00, 'NORMAL', 0);