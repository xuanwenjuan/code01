-- 创建数据库
CREATE DATABASE IF NOT EXISTS ev_parts_manage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE ev_parts_manage;

-- 1. 用户表
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) COMMENT '手机号',
    `email` VARCHAR(100) COMMENT '邮箱',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0禁用 1启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 角色表
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `role_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `description` VARCHAR(200) COMMENT '角色描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 3. 用户角色关联表
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 4. 操作日志表
DROP TABLE IF EXISTS `sys_operation_log`;
CREATE TABLE `sys_operation_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT COMMENT '操作人ID',
    `username` VARCHAR(50) COMMENT '操作人用户名',
    `operation` VARCHAR(100) NOT NULL COMMENT '操作描述',
    `method` VARCHAR(200) COMMENT '请求方法',
    `params` TEXT COMMENT '请求参数',
    `ip` VARCHAR(50) COMMENT '操作IP',
    `status` TINYINT DEFAULT 1 COMMENT '操作状态：0失败 1成功',
    `error_msg` TEXT COMMENT '错误信息',
    `cost_time` BIGINT COMMENT '耗时(ms)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 5. 配件产品分类表（无限级分类）
DROP TABLE IF EXISTS `product_category`;
CREATE TABLE `product_category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    `category_name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `category_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0下架 1上架',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配件产品分类表';

-- 6. 配件产品表
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `product_name` VARCHAR(100) NOT NULL COMMENT '产品名称',
    `product_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '产品编码',
    `specification` VARCHAR(200) COMMENT '规格型号',
    `unit` VARCHAR(20) DEFAULT '件' COMMENT '单位',
    `priority` INT DEFAULT 0 COMMENT '排产优先级，数值越大优先级越高',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0停产下架 1在产',
    `standard_time` INT COMMENT '标准工时(分钟)',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配件产品表';

-- 7. 原料表
DROP TABLE IF EXISTS `material`;
CREATE TABLE `material` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `material_name` VARCHAR(100) NOT NULL COMMENT '原料名称',
    `material_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '原料编码',
    `material_type` VARCHAR(50) NOT NULL COMMENT '原料类型：铝合金型材/铜材线圈/塑料壳体/橡胶减震件/电子元器件',
    `specification` VARCHAR(200) COMMENT '规格型号',
    `unit` VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    `moisture_proof` TINYINT DEFAULT 0 COMMENT '是否防潮：0否 1是',
    `warning_stock` DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0停止采购 1正常采购',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

-- 8. 原料库存表
DROP TABLE IF EXISTS `material_stock`;
CREATE TABLE `material_stock` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `material_id` BIGINT NOT NULL COMMENT '原料ID',
    `batch_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    `quantity` DECIMAL(10,2) NOT NULL COMMENT '库存数量',
    `unit_price` DECIMAL(10,2) COMMENT '单价',
    `warehouse` VARCHAR(50) COMMENT '仓库位置',
    `inbound_date` DATE COMMENT '入库日期',
    `expiry_date` DATE COMMENT '有效期至',
    `stock_status` TINYINT DEFAULT 1 COMMENT '库存状态：1库存充足 2库存预警 3已过期',
    `moisture_check_time` DATETIME COMMENT '防潮检查时间',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_material_id` (`material_id`),
    INDEX `idx_batch_no` (`batch_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存表';

-- 9. 生产工单表
DROP TABLE IF EXISTS `work_order`;
CREATE TABLE `work_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    `product_id` BIGINT NOT NULL COMMENT '产品ID',
    `plan_quantity` INT NOT NULL COMMENT '计划数量',
    `actual_quantity` INT DEFAULT 0 COMMENT '实际完成数量',
    `bad_quantity` INT DEFAULT 0 COMMENT '不良品数量',
    `priority` INT DEFAULT 0 COMMENT '优先级',
    `order_status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '工单状态：PENDING待投产 IN_PRODUCTION生产中 SUSPENDED已暂停 COMPLETED已完成 CANCELLED已取消',
    `plan_start_date` DATE COMMENT '计划开始日期',
    `plan_end_date` DATE COMMENT '计划完成日期',
    `actual_start_time` DATETIME COMMENT '实际开始时间',
    `actual_end_time` DATETIME COMMENT '实际完成时间',
    `workshop` VARCHAR(50) COMMENT '生产车间',
    `line` VARCHAR(50) COMMENT '生产线',
    `operator_id` BIGINT COMMENT '负责人ID',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_by` BIGINT COMMENT '创建人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_order_no` (`order_no`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_order_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 10. 工单工序表
DROP TABLE IF EXISTS `work_order_process`;
CREATE TABLE `work_order_process` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `work_order_id` BIGINT NOT NULL COMMENT '工单ID',
    `process_code` VARCHAR(50) NOT NULL COMMENT '工序编码',
    `process_name` VARCHAR(100) NOT NULL COMMENT '工序名称',
    `process_type` VARCHAR(50) NOT NULL COMMENT '工序类型：CUTTING裁切 STAMPING冲压 WINDING绕制 ASSEMBLY组装 TESTING通电检测 DURABILITY耐久测试',
    `sort_order` INT DEFAULT 0 COMMENT '工序顺序',
    `process_status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '工序状态：PENDING待开始 IN_PROGRESS进行中 COMPLETED已完成',
    `operator_id` BIGINT COMMENT '操作人ID',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '完成时间',
    `qualified_quantity` INT DEFAULT 0 COMMENT '合格数量',
    `bad_quantity` INT DEFAULT 0 COMMENT '不良数量',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_work_order_id` (`work_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单工序表';

-- 11. 工单用料表
DROP TABLE IF EXISTS `work_order_material`;
CREATE TABLE `work_order_material` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `work_order_id` BIGINT NOT NULL COMMENT '工单ID',
    `material_id` BIGINT NOT NULL COMMENT '原料ID',
    `material_stock_id` BIGINT COMMENT '原料库存ID',
    `plan_quantity` DECIMAL(10,2) NOT NULL COMMENT '计划用量',
    `actual_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    `unit_price` DECIMAL(10,2) COMMENT '单价',
    `total_price` DECIMAL(12,2) COMMENT '总价',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_work_order_id` (`work_order_id`),
    INDEX `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单用料表';

-- 12. 生产成本表
DROP TABLE IF EXISTS `production_cost`;
CREATE TABLE `production_cost` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `cost_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '成本单号',
    `work_order_id` BIGINT NOT NULL COMMENT '工单ID',
    `product_id` BIGINT NOT NULL COMMENT '产品ID',
    `total_material_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    `total_mold_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '模具损耗成本',
    `total_energy_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '设备能耗成本',
    `total_labor_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '人工工时成本',
    `total_scrap_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '不良品报废成本',
    `total_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    `unit_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    `cost_date` DATE COMMENT '成本核算日期',
    `status` TINYINT DEFAULT 0 COMMENT '状态：0草稿 1已确认 2已对账',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_work_order_id` (`work_order_id`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_cost_date` (`cost_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

-- 13. 成本明细项表
DROP TABLE IF EXISTS `cost_detail`;
CREATE TABLE `cost_detail` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `production_cost_id` BIGINT NOT NULL COMMENT '生产成本ID',
    `cost_type` VARCHAR(50) NOT NULL COMMENT '成本类型：MATERIAL原料 MOLD模具 ENERGY能耗 LABOR人工 SCRAP报废',
    `item_name` VARCHAR(100) NOT NULL COMMENT '成本项名称',
    `quantity` DECIMAL(10,2) COMMENT '数量',
    `unit_price` DECIMAL(10,2) COMMENT '单价',
    `total_price` DECIMAL(12,2) NOT NULL COMMENT '总价',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX `idx_production_cost_id` (`production_cost_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本明细项表';

-- ==================== 初始化数据 ====================

-- 初始化角色数据
INSERT INTO `sys_role` (`role_code`, `role_name`, `description`) VALUES
('ADMIN', '系统管理员', '拥有系统全部权限'),
('PURCHASE', '采购专员', '负责原料采购管理'),
('PROCESS', '工艺工程师', '负责产品工艺设计'),
('PRODUCTION', '生产主管', '负责生产工单管理'),
('QUALITY', '质检专员', '负责产品质量检验');

-- 初始化用户数据（密码：123456）
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `phone`, `email`) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 'admin@evparts.com'),
('purchase01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张采购', '13800138001', 'purchase01@evparts.com'),
('process01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李工艺', '13800138002', 'process01@evparts.com'),
('production01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王生产', '13800138003', 'production01@evparts.com'),
('quality01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵质检', '13800138004', 'quality01@evparts.com');

-- 初始化用户角色关联
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- 初始化产品分类数据
INSERT INTO `product_category` (`parent_id`, `category_name`, `category_code`, `sort_order`) VALUES
(0, '电机配件', 'MOTOR', 1),
(0, '车架配件', 'FRAME', 2),
(0, '电控配件', 'CONTROLLER', 3),
(0, '刹车减震配件', 'BRAKE_SUSPENSION', 4),
(1, '电机定子', 'MOTOR_STATOR', 1),
(1, '电机转子', 'MOTOR_ROTOR', 2),
(1, '电机外壳', 'MOTOR_HOUSING', 3),
(2, '主车架', 'MAIN_FRAME', 1),
(2, '后摇臂', 'REAR_SWINGARM', 2),
(2, '前叉', 'FRONT_FORK', 3),
(3, '控制器', 'ECU', 1),
(3, '线束组件', 'WIRING_HARNESS', 2),
(3, '传感器', 'SENSOR', 3),
(4, '刹车盘', 'BRAKE_DISC', 1),
(4, '减震器', 'SHOCK_ABSORBER', 2),
(4, '刹车片', 'BRAKE_PAD', 3);

-- 初始化原料数据
INSERT INTO `material` (`material_name`, `material_code`, `material_type`, `specification`, `unit`, `moisture_proof`, `warning_stock`) VALUES
('6061铝合金型材', 'AL6061_001', '铝合金型材', '6061-T6 50*50*3', 'kg', 0, 100.00),
('7075铝合金型材', 'AL7075_001', '铝合金型材', '7075-T6 30*30*2', 'kg', 0, 80.00),
('无氧铜线圈', 'CU_001', '铜材线圈', '0.8mm 无氧铜', 'kg', 0, 50.00),
('漆包铜线', 'CU_002', '铜材线圈', '0.5mm 2UEW', 'kg', 0, 60.00),
('ABS塑料颗粒', 'PLASTIC_001', '塑料壳体', 'ABS PA-757K', 'kg', 0, 200.00),
('PC塑料颗粒', 'PLASTIC_002', '塑料壳体', 'PC 2805', 'kg', 0, 150.00),
('天然橡胶', 'RUBBER_001', '橡胶减震件', 'NR 3L', 'kg', 0, 100.00),
('丁腈橡胶', 'RUBBER_002', '橡胶减震件', 'NBR 70', 'kg', 0, 80.00),
('STM32微控制器', 'IC_001', '电子元器件', 'STM32F103C8T6', 'pcs', 1, 500.00),
('电阻电容套装', 'IC_002', '电子元器件', '0805 1%精度', 'pcs', 1, 1000.00),
('PCB电路板', 'IC_003', '电子元器件', 'FR-4 2层板', 'pcs', 1, 300.00);
