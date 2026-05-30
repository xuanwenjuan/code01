-- 家用健身器材组装生产管控系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS fitness_manufacture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fitness_manufacture;

-- 1. 系统用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    dept_id BIGINT COMMENT '部门ID',
    post_code VARCHAR(50) COMMENT '岗位编码',
    remark VARCHAR(500) COMMENT '备注',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0未删除 1已删除',
    INDEX idx_username (username),
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 2. 系统角色表
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_sort INT DEFAULT 0 COMMENT '显示顺序',
    status TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 3. 用户角色关联表
DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 4. 系统菜单表
DROP TABLE IF EXISTS sys_menu;
CREATE TABLE sys_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜单ID',
    menu_name VARCHAR(50) NOT NULL COMMENT '菜单名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    order_num INT DEFAULT 0 COMMENT '显示顺序',
    path VARCHAR(200) COMMENT '路由地址',
    component VARCHAR(255) COMMENT '组件路径',
    perms VARCHAR(100) COMMENT '权限标识',
    type CHAR(1) DEFAULT 'M' COMMENT '菜单类型 M目录 C菜单 F按钮',
    icon VARCHAR(100) DEFAULT '#' COMMENT '菜单图标',
    visible TINYINT DEFAULT 1 COMMENT '显示状态 0隐藏 1显示',
    status TINYINT DEFAULT 1 COMMENT '状态 0停用 1正常',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';

-- 5. 角色菜单关联表
DROP TABLE IF EXISTS sys_role_menu;
CREATE TABLE sys_role_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    INDEX idx_role_id (role_id),
    INDEX idx_menu_id (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- 6. 产品分类表
DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    icon VARCHAR(255) COMMENT '图标',
    description VARCHAR(500) COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0停用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 7. 产品表
DROP TABLE IF EXISTS product;
CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    product_code VARCHAR(50) NOT NULL UNIQUE COMMENT '产品编码',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    category_path VARCHAR(500) COMMENT '分类路径',
    specification VARCHAR(200) COMMENT '规格',
    model VARCHAR(100) COMMENT '型号',
    image_url VARCHAR(500) COMMENT '图片地址',
    standard_cost DECIMAL(12,2) DEFAULT 0 COMMENT '标准成本',
    sale_price DECIMAL(12,2) DEFAULT 0 COMMENT '销售价格',
    priority INT DEFAULT 0 COMMENT '排产优先级',
    status TINYINT DEFAULT 1 COMMENT '状态 0停止量产 1正常生产',
    description TEXT COMMENT '产品描述',
    production_process TEXT COMMENT '生产工艺',
    estimated_hours INT DEFAULT 0 COMMENT '预估工时(分钟)',
    weight DECIMAL(10,2) COMMENT '重量(kg)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_category_id (category_id),
    INDEX idx_product_code (product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- 8. 物料表
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_type VARCHAR(50) COMMENT '物料类型：加厚钢管/承重钢板/弹力橡塑件/健身电子配件/防滑组装辅料',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) DEFAULT '个' COMMENT '单位',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    stock_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '预警数量',
    status TINYINT DEFAULT 1 COMMENT '状态 0终止采购 1正常库存 2库存预警',
    shelf_life_days INT DEFAULT 0 COMMENT '保质期(天)，0表示无保质期',
    supplier VARCHAR(200) COMMENT '供应商',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_material_code (material_code),
    INDEX idx_material_type (material_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料表';

-- 9. 物料批次表
DROP TABLE IF EXISTS material_batch;
CREATE TABLE material_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '数量',
    locked_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '锁定数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '过期日期',
    status TINYINT DEFAULT 1 COMMENT '状态 0已用完 1正常 2即将过期 3已过期',
    warehouse_location VARCHAR(100) COMMENT '库位',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_id (material_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料批次表';

-- 10. 物料入库单
DROP TABLE IF EXISTS material_inbound;
CREATE TABLE material_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '入库ID',
    inbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '入库数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    supplier VARCHAR(200) COMMENT '供应商',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '过期日期',
    warehouse_location VARCHAR(100) COMMENT '库位',
    status TINYINT DEFAULT 0 COMMENT '状态 0待审核 1已入库 2已驳回',
    audit_by BIGINT COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_inbound_no (inbound_no),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料入库单';

-- 11. 物料出库单
DROP TABLE IF EXISTS material_outbound;
CREATE TABLE material_outbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '出库ID',
    outbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    work_order_id BIGINT COMMENT '关联工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '出库数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    outbound_type VARCHAR(50) COMMENT '出库类型：生产领用/调拨/报废',
    receiver VARCHAR(50) COMMENT '领用人',
    status TINYINT DEFAULT 0 COMMENT '状态 0待审核 1已出库 2已驳回',
    audit_by BIGINT COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_outbound_no (outbound_no),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料出库单';

-- 12. 产品物料清单(BOM)
DROP TABLE IF EXISTS product_bom;
CREATE TABLE product_bom (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'BOM ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    quantity DECIMAL(12,2) DEFAULT 0 COMMENT '用量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_product_id (product_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品物料清单';

-- 13. 生产工单表
DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    work_order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    plan_quantity INT DEFAULT 0 COMMENT '计划数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际完成数量',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 0 COMMENT '工单状态 0待分配 1待开始 2进行中 3已暂停 4质检中 5已完成 6已取消',
    current_process VARCHAR(100) COMMENT '当前工序',
    process_progress INT DEFAULT 0 COMMENT '工序进度(%)',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    total_hours DECIMAL(10,2) DEFAULT 0 COMMENT '总工时(小时)',
    line_leader_id BIGINT COMMENT '产线组长ID',
    line_leader_name VARCHAR(50) COMMENT '产线组长',
    remark VARCHAR(500) COMMENT '备注',
    is_frozen TINYINT DEFAULT 0 COMMENT '是否冻结 0否 1是',
    frozen_reason VARCHAR(500) COMMENT '冻结原因',
    frozen_time DATETIME COMMENT '冻结时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_work_order_no (work_order_no),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_line_leader_id (line_leader_id),
    INDEX idx_plan_start_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 14. 工单工序表
DROP TABLE IF EXISTS work_order_process;
CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工序ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称：切割折弯/框架焊接/配件装配/弹力调试/安全测试/外观打磨/打包入库',
    process_order INT DEFAULT 0 COMMENT '工序顺序',
    status TINYINT DEFAULT 0 COMMENT '工序状态 0待开始 1进行中 2已完成 3已跳过',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    hours_used DECIMAL(10,2) DEFAULT 0 COMMENT '使用工时(小时)',
    quality_check_result VARCHAR(20) COMMENT '质检结果：合格/不合格/待检',
    quality_check_by BIGINT COMMENT '质检员ID',
    quality_check_time DATETIME COMMENT '质检时间',
    quality_issue TEXT COMMENT '质量问题描述',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_process_code (process_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

-- 15. 工单物料分配表
DROP TABLE IF EXISTS work_order_material;
CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    planned_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '计划用量',
    actual_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '实际用量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    status TINYINT DEFAULT 0 COMMENT '状态 0待领用 1已领用 2已退回',
    outbound_time DATETIME COMMENT '出库时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料分配表';

-- 16. 成本统计表
DROP TABLE IF EXISTS cost_statistics;
CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    work_order_id BIGINT COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单编号',
    product_id BIGINT COMMENT '产品ID',
    category_id BIGINT COMMENT '分类ID',
    product_name VARCHAR(100) COMMENT '产品名称',
    metal_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '金属材料成本',
    plastic_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '塑料材料成本',
    electronic_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '电子材料成本',
    auxiliary_material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '辅助材料成本',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '材料总成本',
    welding_rod_cost DECIMAL(12,2) DEFAULT 0 COMMENT '焊条成本',
    welding_gas_cost DECIMAL(12,2) DEFAULT 0 COMMENT '焊接气体成本',
    welding_cost DECIMAL(12,2) DEFAULT 0 COMMENT '焊接耗材总成本',
    cutting_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '切割人工成本',
    assembly_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '组装人工成本',
    grinding_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '打磨人工成本',
    qc_labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '质检人工成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工总成本',
    cutting_machine_cost DECIMAL(12,2) DEFAULT 0 COMMENT '切割机成本',
    welding_machine_cost DECIMAL(12,2) DEFAULT 0 COMMENT '焊接机成本',
    assembly_machine_cost DECIMAL(12,2) DEFAULT 0 COMMENT '组装设备成本',
    electricity_cost DECIMAL(12,2) DEFAULT 0 COMMENT '电费成本',
    equipment_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备能耗总成本',
    material_scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '材料报废成本',
    rework_cost DECIMAL(12,2) DEFAULT 0 COMMENT '返工成本',
    scrap_cost DECIMAL(12,2) DEFAULT 0 COMMENT '报废损耗总成本',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(12,2) DEFAULT 0 COMMENT '单位成本',
    plan_quantity INT DEFAULT 0 COMMENT '计划数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际数量',
    scrap_quantity INT DEFAULT 0 COMMENT '报废数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    pass_rate DECIMAL(5,4) DEFAULT 0 COMMENT '合格率',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    statistics_date DATE COMMENT '统计日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_statistics_date (statistics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

-- 17. 工单物料锁定表
DROP TABLE IF EXISTS work_order_material_lock;
CREATE TABLE work_order_material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '锁定ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_id BIGINT COMMENT '批次ID',
    batch_no VARCHAR(50) COMMENT '批次编号',
    locked_quantity DECIMAL(12,2) DEFAULT 0 COMMENT '锁定数量',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '总金额',
    status TINYINT DEFAULT 1 COMMENT '状态 0已释放 1已锁定 2已扣减',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单物料锁定表';

-- 17. 月度生产报表
DROP TABLE IF EXISTS monthly_production_report;
CREATE TABLE monthly_production_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_month VARCHAR(7) NOT NULL COMMENT '报表月份 yyyy-MM',
    total_orders INT DEFAULT 0 COMMENT '总工单数量',
    completed_orders INT DEFAULT 0 COMMENT '完成工单数量',
    total_quantity INT DEFAULT 0 COMMENT '总生产数量',
    total_material_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总主材成本',
    total_welding_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总焊接耗材成本',
    total_labor_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总人工成本',
    total_equipment_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总设备能耗成本',
    total_scrap_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总报废损耗成本',
    total_cost DECIMAL(15,2) DEFAULT 0 COMMENT '总成本',
    total_sales DECIMAL(15,2) DEFAULT 0 COMMENT '总销售额',
    gross_profit DECIMAL(15,2) DEFAULT 0 COMMENT '毛利润',
    gross_margin DECIMAL(5,2) DEFAULT 0 COMMENT '毛利率(%)',
    status TINYINT DEFAULT 0 COMMENT '状态 0草稿 1已确认',
    generate_time DATETIME COMMENT '生成时间',
    confirm_by BIGINT COMMENT '确认人',
    confirm_time DATETIME COMMENT '确认时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_report_month (report_month),
    INDEX idx_report_month (report_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度生产报表';

-- 18. 操作日志表
DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    module VARCHAR(100) COMMENT '模块',
    operation VARCHAR(200) COMMENT '操作',
    business_type VARCHAR(50) COMMENT '业务类型',
    method VARCHAR(200) COMMENT '方法名',
    request_method VARCHAR(10) COMMENT '请求方式',
    operator_type VARCHAR(20) COMMENT '操作人类型',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    dept_id BIGINT COMMENT '部门ID',
    dept_name VARCHAR(100) COMMENT '部门名称',
    oper_url VARCHAR(255) COMMENT '请求URL',
    oper_ip VARCHAR(50) COMMENT '主机地址',
    oper_location VARCHAR(255) COMMENT '操作地点',
    oper_param TEXT COMMENT '请求参数',
    json_result TEXT COMMENT '返回参数',
    status TINYINT DEFAULT 1 COMMENT '操作状态 0失败 1成功',
    error_msg TEXT COMMENT '错误消息',
    cost_time BIGINT DEFAULT 0 COMMENT '消耗时间(毫秒)',
    oper_time DATETIME COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_oper_time (oper_time),
    INDEX idx_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 19. 库存预警记录表
DROP TABLE IF EXISTS stock_warning;
CREATE TABLE stock_warning (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warning_type VARCHAR(50) NOT NULL COMMENT '预警类型：库存不足/即将过期/已过期',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    current_quantity DECIMAL(12,2) COMMENT '当前数量',
    warning_quantity DECIMAL(12,2) COMMENT '预警阈值',
    expiry_date DATE COMMENT '过期日期',
    days_to_expiry INT COMMENT '距过期天数',
    status TINYINT DEFAULT 0 COMMENT '状态 0未处理 1已处理',
    handler_id BIGINT COMMENT '处理人',
    handle_time DATETIME COMMENT '处理时间',
    handle_remark VARCHAR(500) COMMENT '处理备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_warning_type (warning_type),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存预警记录表';

-- ==================== 初始化数据 ====================

-- 初始化角色数据
INSERT INTO sys_role (role_code, role_name, role_sort, status, remark) VALUES
('PURCHASE', '物料采购员', 1, 1, '负责物料采购、入库管理'),
('PROCESS', '结构工艺员', 2, 1, '负责产品工艺制定、BOM维护'),
('LINE_LEADER', '产线组长', 3, 1, '负责工单管理、生产调度'),
('QC', '安全质检员', 4, 1, '负责质量检验、安全检查'),
('ADMIN', '系统管理员', 99, 1, '系统最高权限');

-- 初始化用户数据 (密码: 123456 BCrypt加密)
INSERT INTO sys_user (username, password, real_name, phone, status, post_code) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800000001', 1, 'ADMIN'),
('purchase01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张采购', '13800000002', 1, 'PURCHASE'),
('process01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李工艺', '13800000003', 1, 'PROCESS'),
('leader01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王组长', '13800000004', 1, 'LINE_LEADER'),
('qc01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵质检', '13800000005', 1, 'QC');

-- 用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 5), (2, 1), (3, 2), (4, 3), (5, 4);

-- 初始化产品分类
INSERT INTO product_category (category_name, category_code, parent_id, level, sort, status) VALUES
('力量训练器材', 'STRENGTH', 0, 1, 1, 1),
('有氧健身器材', 'CARDIO', 0, 1, 2, 1),
('瑜伽辅助器材', 'YOGA', 0, 1, 3, 1),
('小型便携健身器材', 'PORTABLE', 0, 1, 4, 1),
('哑铃系列', 'DUMBBELL', 1, 2, 1, 1),
('杠铃系列', 'BARBELL', 1, 2, 2, 1),
('跑步机系列', 'TREADMILL', 2, 2, 1, 1),
('动感单车系列', 'SPINNING', 2, 2, 2, 1);

-- 初始化物料数据
INSERT INTO material (material_name, material_code, material_type, specification, unit, unit_price, stock_quantity, warning_quantity, status, shelf_life_days, supplier) VALUES
('加厚钢管Q235', 'MAT-001', '加厚钢管', 'Φ50*2mm', '根', 120.00, 500, 100, 1, 0, '鞍山钢铁集团'),
('加厚钢管Q235', 'MAT-002', '加厚钢管', 'Φ32*1.5mm', '根', 85.00, 800, 150, 1, 0, '鞍山钢铁集团'),
('承重钢板', 'MAT-003', '承重钢板', '10mm厚', '块', 180.00, 300, 50, 1, 0, '宝钢集团'),
('天然橡胶管', 'MAT-004', '弹力橡塑件', 'Φ8*500mm', '根', 25.00, 2000, 500, 1, 365, '东莞橡胶制品厂'),
('拉力弹簧', 'MAT-005', '弹力橡塑件', '不锈钢', '个', 15.00, 5000, 1000, 1, 0, '温州弹簧厂'),
('电子计数器', 'MAT-006', '健身电子配件', 'LCD显示', '个', 45.00, 1000, 200, 1, 730, '深圳电子科技'),
('心率传感器', 'MAT-007', '健身电子配件', '光电式', '个', 85.00, 500, 100, 1, 730, '深圳电子科技'),
('防滑橡胶垫', 'MAT-008', '防滑组装辅料', '5mm厚', '米', 35.00, 3000, 800, 1, 540, '东莞橡胶制品厂'),
('不锈钢螺丝M8', 'MAT-009', '防滑组装辅料', 'M8*20', '个', 0.80, 50000, 10000, 1, 0, '浙江标准件厂'),
('焊接焊丝', 'MAT-010', '防滑组装辅料', '1.2mm', 'kg', 65.00, 200, 50, 1, 0, '天津焊接材料厂');
