-- 工业齿轮精密滚齿加工管控系统数据库脚本

CREATE DATABASE IF NOT EXISTS gear_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gear_manufacture;

-- 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(50) NOT NULL COMMENT '角色：PURCHASE-采购专员, PROCESS_ENGINEER-工艺工程师, PRODUCTION_LEADER-生产组长, QUALITY_INSPECTOR-质检人员, FINANCE-财务, ADMIN-管理员',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记：0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 系统角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_type INT DEFAULT 1 COMMENT '角色类型',
    data_scope VARCHAR(50) DEFAULT 'ALL' COMMENT '数据权限范围',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 系统菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    menu_code VARCHAR(50) NOT NULL UNIQUE COMMENT '菜单编码',
    menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT DEFAULT 1 COMMENT '层级',
    menu_type INT DEFAULT 1 COMMENT '菜单类型：1-目录, 2-菜单, 3-按钮',
    path VARCHAR(200) COMMENT '路由路径',
    component VARCHAR(200) COMMENT '组件路径',
    icon VARCHAR(100) COMMENT '图标',
    permission VARCHAR(200) COMMENT '权限标识',
    sort INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    role_code VARCHAR(50) COMMENT '角色编码',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    menu_code VARCHAR(50) COMMENT '菜单编码',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    role_code VARCHAR(50) COMMENT '角色编码',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 仓库表
CREATE TABLE IF NOT EXISTS warehouse (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    warehouse_code VARCHAR(50) NOT NULL UNIQUE COMMENT '仓库编码',
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    warehouse_type VARCHAR(50) COMMENT '仓库类型：1-原料仓, 2-半成品仓, 3-成品仓, 4-辅料仓',
    address VARCHAR(200) COMMENT '仓库地址',
    manager VARCHAR(50) COMMENT '负责人',
    phone VARCHAR(20) COMMENT '联系电话',
    capacity INT COMMENT '容量',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

-- 齿轮产品类目表
CREATE TABLE IF NOT EXISTS gear_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '优先级',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-下线',
    description TEXT COMMENT '描述',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='齿轮产品类目表';

-- 坯料库存表
CREATE TABLE IF NOT EXISTS material_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(50) COMMENT '物料类型：45号钢,合金钢,调质精锻坯,渗碳辅料',
    material_spec VARCHAR(100) COMMENT '物料规格',
    quantity DECIMAL(18,2) NOT NULL COMMENT '可用数量',
    locked_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '锁定数量',
    unit VARCHAR(20) DEFAULT '件' COMMENT '单位',
    warn_quantity DECIMAL(18,2) COMMENT '预警数量',
    stock_status INT DEFAULT 1 COMMENT '库存状态：1-充足, 2-预警, 3-停止采购',
    in_date DATE COMMENT '入库日期',
    rust_proof_days INT COMMENT '防锈有效期(天)',
    rust_proof_expire_date DATE COMMENT '防锈到期日期',
    warehouse VARCHAR(50) COMMENT '仓库',
    location VARCHAR(50) COMMENT '库位',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='坯料库存表';

-- 入库单表
CREATE TABLE IF NOT EXISTS stock_in (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    in_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    in_type INT DEFAULT 1 COMMENT '入库类型：1-采购入库, 2-生产入库, 3-盘点入库, 4-退货入库',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单号',
    supplier_name VARCHAR(100) COMMENT '供应商名称',
    contact VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    plan_date DATE COMMENT '计划入库日期',
    actual_date DATE COMMENT '实际入库日期',
    status INT DEFAULT 1 COMMENT '状态：1-待审核, 2-已入库, 3-已驳回',
    total_amount DECIMAL(18,2) COMMENT '总金额',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_date DATE COMMENT '审核日期',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单表';

-- 入库单明细表
CREATE TABLE IF NOT EXISTS stock_in_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    in_id BIGINT NOT NULL COMMENT '入库单ID',
    in_no VARCHAR(50) COMMENT '入库单号',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_spec VARCHAR(100) COMMENT '物料规格',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(18,2) COMMENT '数量',
    unit_price DECIMAL(18,2) COMMENT '单价',
    amount DECIMAL(18,2) COMMENT '金额',
    unit VARCHAR(20) COMMENT '单位',
    location VARCHAR(50) COMMENT '库位',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单明细表';

-- 出库单表
CREATE TABLE IF NOT EXISTS stock_out (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    out_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    out_type INT DEFAULT 1 COMMENT '出库类型：1-生产领料, 2-销售出库, 3-盘点出库, 4-报废出库',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    order_id BIGINT COMMENT '关联工单ID',
    order_no VARCHAR(50) COMMENT '关联工单号',
    receiver VARCHAR(50) COMMENT '领用人',
    receiver_phone VARCHAR(20) COMMENT '领用电话',
    plan_date DATE COMMENT '计划出库日期',
    actual_date DATE COMMENT '实际出库日期',
    status INT DEFAULT 1 COMMENT '状态：1-待审核, 2-已出库, 3-已驳回',
    total_amount DECIMAL(18,2) COMMENT '总金额',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_date DATE COMMENT '审核日期',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库单表';

-- 出库单明细表
CREATE TABLE IF NOT EXISTS stock_out_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    out_id BIGINT NOT NULL COMMENT '出库单ID',
    out_no VARCHAR(50) COMMENT '出库单号',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_spec VARCHAR(100) COMMENT '物料规格',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(18,2) COMMENT '数量',
    unit_price DECIMAL(18,2) COMMENT '单价',
    amount DECIMAL(18,2) COMMENT '金额',
    unit VARCHAR(20) COMMENT '单位',
    location VARCHAR(50) COMMENT '库位',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库单明细表';

-- 盘点单表
CREATE TABLE IF NOT EXISTS stock_check (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    check_no VARCHAR(50) NOT NULL UNIQUE COMMENT '盘点单号',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    check_date DATE COMMENT '盘点日期',
    check_type INT DEFAULT 1 COMMENT '盘点类型：1-全盘, 2-抽盘',
    status INT DEFAULT 1 COMMENT '状态：1-待盘点, 2-盘点中, 3-已完成, 4-已审核',
    checker VARCHAR(50) COMMENT '盘点人',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_date DATE COMMENT '审核日期',
    diff_count INT DEFAULT 0 COMMENT '差异数量',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点单表';

-- 盘点单明细表
CREATE TABLE IF NOT EXISTS stock_check_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    check_id BIGINT NOT NULL COMMENT '盘点单ID',
    check_no VARCHAR(50) COMMENT '盘点单号',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_spec VARCHAR(100) COMMENT '物料规格',
    batch_no VARCHAR(50) COMMENT '批次号',
    system_quantity DECIMAL(18,2) COMMENT '系统数量',
    actual_quantity DECIMAL(18,2) COMMENT '实际数量',
    diff_quantity DECIMAL(18,2) COMMENT '差异数量',
    unit VARCHAR(20) COMMENT '单位',
    location VARCHAR(50) COMMENT '库位',
    diff_reason TEXT COMMENT '差异原因',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点单明细表';

-- 移库单表
CREATE TABLE IF NOT EXISTS stock_transfer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    transfer_no VARCHAR(50) NOT NULL UNIQUE COMMENT '移库单号',
    from_warehouse_id BIGINT COMMENT '调出仓库ID',
    from_warehouse_name VARCHAR(100) COMMENT '调出仓库名称',
    to_warehouse_id BIGINT COMMENT '调入仓库ID',
    to_warehouse_name VARCHAR(100) COMMENT '调入仓库名称',
    plan_date DATE COMMENT '计划移库日期',
    actual_date DATE COMMENT '实际移库日期',
    status INT DEFAULT 1 COMMENT '状态：1-待审核, 2-移库中, 3-已完成, 4-已驳回',
    total_quantity DECIMAL(18,2) COMMENT '总数量',
    handler VARCHAR(50) COMMENT '经办人',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_date DATE COMMENT '审核日期',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='移库单表';

-- 移库单明细表
CREATE TABLE IF NOT EXISTS stock_transfer_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    transfer_id BIGINT NOT NULL COMMENT '移库单ID',
    transfer_no VARCHAR(50) COMMENT '移库单号',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_spec VARCHAR(100) COMMENT '物料规格',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(18,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    from_location VARCHAR(50) COMMENT '调出库位',
    to_location VARCHAR(50) COMMENT '调入库位',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='移库单明细表';

-- 库存流水表
CREATE TABLE IF NOT EXISTS stock_flow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    flow_no VARCHAR(50) NOT NULL UNIQUE COMMENT '流水号',
    flow_type INT COMMENT '流水类型：1-入库, 2-出库, 3-移库, 4-盘点调整',
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_spec VARCHAR(100) COMMENT '物料规格',
    batch_no VARCHAR(50) COMMENT '批次号',
    before_quantity DECIMAL(18,2) COMMENT '变动前数量',
    change_quantity DECIMAL(18,2) COMMENT '变动数量',
    after_quantity DECIMAL(18,2) COMMENT '变动后数量',
    unit VARCHAR(20) COMMENT '单位',
    location VARCHAR(50) COMMENT '库位',
    related_no VARCHAR(50) COMMENT '关联单号',
    operate_time DATETIME COMMENT '操作时间',
    operator VARCHAR(50) COMMENT '操作人',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存流水表';

-- BOM表
CREATE TABLE IF NOT EXISTS bom (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    bom_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'BOM编码',
    bom_name VARCHAR(100) NOT NULL COMMENT 'BOM名称',
    product_id BIGINT COMMENT '产品ID',
    product_code VARCHAR(50) COMMENT '产品编码',
    product_name VARCHAR(100) COMMENT '产品名称',
    product_spec VARCHAR(100) COMMENT '产品规格',
    version INT DEFAULT 1 COMMENT '版本号',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    auditor VARCHAR(50) COMMENT '审核人',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM表';

-- BOM明细表
CREATE TABLE IF NOT EXISTS bom_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    bom_id BIGINT NOT NULL COMMENT 'BOM ID',
    bom_code VARCHAR(50) COMMENT 'BOM编码',
    material_id BIGINT COMMENT '物料ID',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_spec VARCHAR(100) COMMENT '物料规格',
    quantity DECIMAL(18,4) COMMENT '用量',
    unit VARCHAR(20) COMMENT '单位',
    sort INT DEFAULT 0 COMMENT '排序',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM明细表';

-- 工艺路线表
CREATE TABLE IF NOT EXISTS process_route (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    route_code VARCHAR(50) NOT NULL UNIQUE COMMENT '工艺路线编码',
    route_name VARCHAR(100) NOT NULL COMMENT '工艺路线名称',
    product_id BIGINT COMMENT '产品ID',
    product_code VARCHAR(50) COMMENT '产品编码',
    product_name VARCHAR(100) COMMENT '产品名称',
    version INT DEFAULT 1 COMMENT '版本号',
    status INT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    auditor VARCHAR(50) COMMENT '审核人',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工艺路线表';

-- 工艺路线明细表
CREATE TABLE IF NOT EXISTS process_route_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    route_id BIGINT NOT NULL COMMENT '工艺路线ID',
    route_code VARCHAR(50) COMMENT '工艺路线编码',
    process_no INT NOT NULL COMMENT '工序号',
    process_name VARCHAR(100) COMMENT '工序名称',
    workstation_id BIGINT COMMENT '工位ID',
    workstation_name VARCHAR(100) COMMENT '工位名称',
    equipment_id BIGINT COMMENT '设备ID',
    equipment_name VARCHAR(100) COMMENT '设备名称',
    standard_hours DECIMAL(10,2) COMMENT '标准工时',
    standard_price DECIMAL(10,2) COMMENT '标准工价',
    sort INT DEFAULT 0 COMMENT '排序',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工艺路线明细表';

-- 生产工单表
CREATE TABLE IF NOT EXISTS production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    category_id BIGINT COMMENT '产品类目ID',
    gear_model VARCHAR(100) COMMENT '齿轮型号',
    quantity DECIMAL(18,2) COMMENT '生产数量',
    current_process INT DEFAULT 1 COMMENT '当前工序',
    order_status INT DEFAULT 1 COMMENT '工单状态：1-待开工, 2-进行中, 3-待转序, 4-已完成, 5-已暂停',
    plan_start_date DATETIME COMMENT '计划开工日期',
    plan_end_date DATETIME COMMENT '计划完工日期',
    actual_start_date DATETIME COMMENT '实际开工日期',
    actual_end_date DATETIME COMMENT '实际完工日期',
    production_line VARCHAR(50) COMMENT '生产线',
    team_leader VARCHAR(50) COMMENT '班组长',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单工序表
CREATE TABLE IF NOT EXISTS order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    process_no INT NOT NULL COMMENT '工序号',
    process_name VARCHAR(100) COMMENT '工序名称',
    process_status INT DEFAULT 0 COMMENT '工序状态：0-待开始, 1-进行中, 2-已完成',
    operator VARCHAR(50) COMMENT '操作员',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    equipment VARCHAR(100) COMMENT '设备',
    check_result TEXT COMMENT '检测结果',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

-- 生产报工表
CREATE TABLE IF NOT EXISTS production_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    report_no VARCHAR(50) NOT NULL UNIQUE COMMENT '报工编号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    process_id BIGINT COMMENT '工序ID',
    process_no INT COMMENT '工序号',
    process_name VARCHAR(100) COMMENT '工序名称',
    workstation_id BIGINT COMMENT '工位ID',
    workstation_name VARCHAR(100) COMMENT '工位名称',
    equipment_id BIGINT COMMENT '设备ID',
    equipment_name VARCHAR(100) COMMENT '设备名称',
    operator_id BIGINT COMMENT '操作员ID',
    operator_name VARCHAR(50) COMMENT '操作员名称',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    work_hours DECIMAL(10,2) COMMENT '工时',
    plan_quantity DECIMAL(18,2) COMMENT '计划数量',
    actual_quantity DECIMAL(18,2) COMMENT '实际数量',
    good_quantity DECIMAL(18,2) COMMENT '良品数量',
    bad_quantity DECIMAL(18,2) COMMENT '不良数量',
    bad_reason TEXT COMMENT '不良原因',
    status INT DEFAULT 1 COMMENT '状态：1-待审核, 2-已审核, 3-已驳回',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产报工表';

-- 质量检查表
CREATE TABLE IF NOT EXISTS quality_check (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    check_no VARCHAR(50) NOT NULL UNIQUE COMMENT '检验单号',
    check_type INT DEFAULT 1 COMMENT '检验类型：1-首检, 2-巡检, 3-末检, 4-成品检',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    process_id BIGINT COMMENT '工序ID',
    process_no INT COMMENT '工序号',
    process_name VARCHAR(100) COMMENT '工序名称',
    product_id BIGINT COMMENT '产品ID',
    product_code VARCHAR(50) COMMENT '产品编码',
    product_name VARCHAR(100) COMMENT '产品名称',
    product_spec VARCHAR(100) COMMENT '产品规格',
    check_quantity DECIMAL(18,2) COMMENT '检验数量',
    good_quantity DECIMAL(18,2) COMMENT '良品数量',
    bad_quantity DECIMAL(18,2) COMMENT '不良数量',
    repair_quantity DECIMAL(18,2) COMMENT '返修数量',
    scrap_quantity DECIMAL(18,2) COMMENT '报废数量',
    bad_description TEXT COMMENT '不良描述',
    check_standard TEXT COMMENT '检验标准',
    check_result VARCHAR(50) COMMENT '检验结果：PASS-合格, FAIL-不合格, REPAIR-待返修',
    status INT DEFAULT 1 COMMENT '状态：1-待检验, 2-已检验, 3-已审核',
    checker VARCHAR(50) COMMENT '检验人',
    check_time DATETIME COMMENT '检验时间',
    auditor VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检查表';

-- 生产成本表
CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    gear_model VARCHAR(100) COMMENT '齿轮型号',
    quantity DECIMAL(18,2) COMMENT '数量',
    material_cost DECIMAL(18,2) DEFAULT 0 COMMENT '原料成本',
    tool_cost DECIMAL(18,2) DEFAULT 0 COMMENT '刀具损耗',
    energy_cost DECIMAL(18,2) DEFAULT 0 COMMENT '能耗费用',
    labor_cost DECIMAL(18,2) DEFAULT 0 COMMENT '人工工时',
    scrap_cost DECIMAL(18,2) DEFAULT 0 COMMENT '报废成本',
    total_cost DECIMAL(18,2) COMMENT '总成本',
    unit_cost DECIMAL(18,4) COMMENT '单位成本',
    settlement_status VARCHAR(20) DEFAULT 'UNSETTLED' COMMENT '结算状态：UNSETTLED-未结算, SETTLED-已结算',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- 应收单表
CREATE TABLE IF NOT EXISTS finance_receivable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    receivable_no VARCHAR(50) NOT NULL UNIQUE COMMENT '应收单号',
    receivable_type INT DEFAULT 1 COMMENT '应收类型：1-销售应收, 2-其他应收',
    order_id BIGINT COMMENT '关联订单ID',
    order_no VARCHAR(50) COMMENT '关联订单号',
    customer_name VARCHAR(100) COMMENT '客户名称',
    contact VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    total_amount DECIMAL(18,2) COMMENT '应收金额',
    paid_amount DECIMAL(18,2) DEFAULT 0 COMMENT '已收金额',
    unpaid_amount DECIMAL(18,2) COMMENT '未收金额',
    bill_date DATE COMMENT '记账日期',
    due_date DATE COMMENT '到期日期',
    status INT DEFAULT 1 COMMENT '状态：1-待收款, 2-部分收款, 3-已收款, 4-已核销',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应收单表';

-- 应付单表
CREATE TABLE IF NOT EXISTS finance_payable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    payable_no VARCHAR(50) NOT NULL UNIQUE COMMENT '应付单号',
    payable_type INT DEFAULT 1 COMMENT '应付类型：1-采购应付, 2-其他应付',
    order_id BIGINT COMMENT '关联订单ID',
    order_no VARCHAR(50) COMMENT '关联订单号',
    supplier_name VARCHAR(100) COMMENT '供应商名称',
    contact VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    total_amount DECIMAL(18,2) COMMENT '应付金额',
    paid_amount DECIMAL(18,2) DEFAULT 0 COMMENT '已付金额',
    unpaid_amount DECIMAL(18,2) COMMENT '未付金额',
    bill_date DATE COMMENT '记账日期',
    due_date DATE COMMENT '到期日期',
    status INT DEFAULT 1 COMMENT '状态：1-待付款, 2-部分付款, 3-已付款, 4-已核销',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应付单表';

-- 收款单表
CREATE TABLE IF NOT EXISTS finance_receive (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    receive_no VARCHAR(50) NOT NULL UNIQUE COMMENT '收款单号',
    receive_type INT DEFAULT 1 COMMENT '收款类型：1-货款, 2-预收款, 3-其他收款',
    receivable_id BIGINT COMMENT '关联应收单ID',
    receivable_no VARCHAR(50) COMMENT '关联应收单号',
    customer_name VARCHAR(100) COMMENT '客户名称',
    payment_method VARCHAR(50) COMMENT '付款方式',
    bank_account VARCHAR(100) COMMENT '银行账号',
    amount DECIMAL(18,2) COMMENT '收款金额',
    receive_date DATE COMMENT '收款日期',
    receiver VARCHAR(50) COMMENT '收款人',
    status INT DEFAULT 1 COMMENT '状态：1-待确认, 2-已确认',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收款单表';

-- 付款单表
CREATE TABLE IF NOT EXISTS finance_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    payment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '付款单号',
    payment_type INT DEFAULT 1 COMMENT '付款类型：1-货款, 2-预付款, 3-其他付款',
    payable_id BIGINT COMMENT '关联应付单ID',
    payable_no VARCHAR(50) COMMENT '关联应付单号',
    supplier_name VARCHAR(100) COMMENT '供应商名称',
    payment_method VARCHAR(50) COMMENT '付款方式',
    bank_account VARCHAR(100) COMMENT '银行账号',
    amount DECIMAL(18,2) COMMENT '付款金额',
    payment_date DATE COMMENT '付款日期',
    payer VARCHAR(50) COMMENT '付款人',
    status INT DEFAULT 1 COMMENT '状态：1-待确认, 2-已确认',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='付款单表';

-- 发票表
CREATE TABLE IF NOT EXISTS finance_invoice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    invoice_no VARCHAR(50) NOT NULL UNIQUE COMMENT '发票号',
    invoice_type INT DEFAULT 1 COMMENT '发票类型：1-进项发票, 2-销项发票',
    related_id BIGINT COMMENT '关联业务ID',
    related_no VARCHAR(50) COMMENT '关联业务号',
    party_name VARCHAR(100) COMMENT '对方名称',
    tax_no VARCHAR(50) COMMENT '税号',
    address VARCHAR(200) COMMENT '地址',
    phone VARCHAR(20) COMMENT '电话',
    bank_name VARCHAR(100) COMMENT '开户银行',
    bank_account VARCHAR(100) COMMENT '银行账号',
    amount DECIMAL(18,2) COMMENT '不含税金额',
    tax_amount DECIMAL(18,2) COMMENT '税额',
    total_amount DECIMAL(18,2) COMMENT '含税总金额',
    invoice_date DATE COMMENT '开票日期',
    due_date DATE COMMENT '到期日期',
    status INT DEFAULT 1 COMMENT '状态：1-待开票, 2-已开票, 3-已作废',
    drawer VARCHAR(50) COMMENT '开票人',
    auditor VARCHAR(50) COMMENT '审核人',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作',
    description VARCHAR(200) COMMENT '描述',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '参数',
    result TEXT COMMENT '结果',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    ip VARCHAR(50) COMMENT 'IP地址',
    url VARCHAR(200) COMMENT '请求URL',
    http_method VARCHAR(20) COMMENT 'HTTP方法',
    status INT DEFAULT 1 COMMENT '状态：1-成功, 0-失败',
    error_message TEXT COMMENT '错误信息',
    cost_time BIGINT COMMENT '耗时(ms)',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted INT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化用户数据
INSERT INTO sys_user (username, password, real_name, phone, role, status, create_time) VALUES
('admin', '123456', '系统管理员', '13800000000', 'ADMIN', 1, NOW()),
('purchase', '123456', '张采购', '13800138001', 'PURCHASE', 1, NOW()),
('engineer', '123456', '李工', '13800138002', 'PROCESS_ENGINEER', 1, NOW()),
('leader', '123456', '王组长', '13800138003', 'PRODUCTION_LEADER', 1, NOW()),
('inspector', '123456', '赵质检', '138000138004', 'QUALITY_INSPECTOR', 1, NOW()),
('finance', '123456', '孙财务', '13800138005', 'FINANCE', 1, NOW());

-- 初始化角色数据
INSERT INTO sys_role (role_code, role_name, role_type, data_scope, status, create_time) VALUES
('ADMIN', '超级管理员', 1, 'ALL', 1, NOW()),
('PURCHASE', '采购专员', 2, 'SELF', 1, NOW()),
('PROCESS_ENGINEER', '工艺工程师', 2, 'SELF', 1, NOW()),
('PRODUCTION_LEADER', '生产组长', 2, 'DEPT', 1, NOW()),
('QUALITY_INSPECTOR', '质检人员', 2, 'SELF', 1, NOW()),
('FINANCE', '财务人员', 2, 'SELF', 1, NOW());

-- 初始化齿轮类目数据
INSERT INTO gear_category (category_name, category_code, parent_id, level, sort, priority, status, description, create_time) VALUES
('直齿圆柱齿轮', 'GEAR-SPUR', 0, 1, 1, 10, 1, '直齿圆柱齿轮系列', NOW()),
('斜齿传动齿轮', 'GEAR-HELICAL', 0, 1, 2, 9, 1, '斜齿传动齿轮系列', NOW()),
('伞齿锥齿轮', 'GEAR-BEVEL', 0, 1, 3, 8, 1, '伞齿锥齿轮系列', NOW()),
('减速箱非标齿轮', 'GEAR-CUSTOM', 0, 1, 4, 7, 1, '减速箱非标定制齿轮', NOW());

-- 初始化仓库数据
INSERT INTO warehouse (warehouse_code, warehouse_name, warehouse_type, manager, phone, status, create_time) VALUES
('WH001', '原料仓', '1', '仓管A', '13800000011', 1, NOW()),
('WH002', '半成品仓', '2', '仓管B', '13800000012', 1, NOW()),
('WH003', '成品仓', '3', '仓管C', '13800000013', 1, NOW()),
('WH004', '辅料仓', '4', '仓管D', '13800000014', 1, NOW());

-- 创建索引
CREATE INDEX idx_order_process_order_id ON order_process(order_id);
CREATE INDEX idx_production_cost_order_id ON production_cost(order_id);
CREATE INDEX idx_material_stock_batch_no ON material_stock(batch_no);
CREATE INDEX idx_production_order_no ON production_order(order_no);
CREATE INDEX idx_gear_category_parent ON gear_category(parent_id);
CREATE INDEX idx_stock_in_no ON stock_in(in_no);
CREATE INDEX idx_stock_out_no ON stock_out(out_no);
CREATE INDEX idx_stock_check_no ON stock_check(check_no);
CREATE INDEX idx_stock_transfer_no ON stock_transfer(transfer_no);
CREATE INDEX idx_stock_flow_no ON stock_flow(flow_no);
CREATE INDEX idx_production_report_no ON production_report(report_no);
CREATE INDEX idx_quality_check_no ON quality_check(check_no);
CREATE INDEX idx_finance_receivable_no ON finance_receivable(receivable_no);
CREATE INDEX idx_finance_payable_no ON finance_payable(payable_no);
CREATE INDEX idx_finance_invoice_no ON finance_invoice(invoice_no);
CREATE INDEX idx_sys_user_username ON sys_user(username);
CREATE INDEX idx_sys_role_code ON sys_role(role_code);
CREATE INDEX idx_sys_menu_parent ON sys_menu(parent_id);
CREATE INDEX idx_sys_operation_log_module ON sys_operation_log(module);
CREATE INDEX idx_sys_operation_log_username ON sys_operation_log(username);
CREATE INDEX idx_sys_operation_log_create_time ON sys_operation_log(create_time);
CREATE INDEX idx_material_stock_type ON material_stock(material_type);
CREATE INDEX idx_material_stock_status ON material_stock(stock_status);
