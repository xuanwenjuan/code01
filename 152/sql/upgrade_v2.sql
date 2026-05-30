-- 版本升级SQL：添加工艺确认、库存锁定、损耗归集功能

-- 添加工单用料锁定字段
ALTER TABLE `work_order_material`
ADD COLUMN `locked_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '锁定数量' AFTER `actual_quantity`,
ADD COLUMN `lock_status` TINYINT DEFAULT 0 COMMENT '锁定状态：0未锁定 1已锁定 2已释放' AFTER `locked_quantity`,
ADD COLUMN `lock_time` DATETIME NULL COMMENT '锁定时间' AFTER `lock_status`;

-- 添加工单工艺确认字段
ALTER TABLE `work_order`
ADD COLUMN `process_confirmed` TINYINT DEFAULT 0 COMMENT '工艺确认状态：0未确认 1已确认' AFTER `create_by`,
ADD COLUMN `process_confirm_time` DATETIME NULL COMMENT '工艺确认时间' AFTER `process_confirmed`,
ADD COLUMN `process_confirmed_by` BIGINT NULL COMMENT '工艺确认人' AFTER `process_confirm_time`;

-- 添加工序损耗字段
ALTER TABLE `work_order_process`
ADD COLUMN `material_loss` DECIMAL(10,2) DEFAULT 0 COMMENT '原料损耗数量' AFTER `bad_quantity`,
ADD COLUMN `energy_consumption` DECIMAL(10,2) DEFAULT 0 COMMENT '能耗量(度)' AFTER `material_loss`,
ADD COLUMN `labor_hours` DECIMAL(10,2) DEFAULT 0 COMMENT '人工工时(小时)' AFTER `energy_consumption`;

-- 添加成本损耗类型
ALTER TABLE `cost_detail`
ADD COLUMN `loss_type` VARCHAR(50) NULL COMMENT '损耗类型：NORMAL正常损耗 ABNORMAL异常损耗' AFTER `cost_type`;

-- 创建原料锁定记录表
DROP TABLE IF EXISTS `material_lock_log`;
CREATE TABLE `material_lock_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `work_order_id` BIGINT NOT NULL COMMENT '工单ID',
    `work_order_material_id` BIGINT NOT NULL COMMENT '工单用料ID',
    `material_id` BIGINT NOT NULL COMMENT '原料ID',
    `material_stock_id` BIGINT NULL COMMENT '原料库存ID',
    `lock_quantity` DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    `lock_type` VARCHAR(20) NOT NULL COMMENT '锁定类型：PROCESS工艺锁定 PICKING领料锁定',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1已锁定 2已释放',
    `operator_id` BIGINT COMMENT '操作人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `release_time` DATETIME NULL COMMENT '释放时间',
    INDEX `idx_work_order_id` (`work_order_id`),
    INDEX `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料锁定记录表';

-- 创建设备能耗表
DROP TABLE IF EXISTS `equipment_energy`;
CREATE TABLE `equipment_energy` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `equipment_code` VARCHAR(50) NOT NULL COMMENT '设备编码',
    `equipment_name` VARCHAR(100) NOT NULL COMMENT '设备名称',
    `process_type` VARCHAR(50) COMMENT '适用工序',
    `power_rating` DECIMAL(10,2) COMMENT '额定功率(KW)',
    `unit_price` DECIMAL(10,4) DEFAULT 1.5 COMMENT '电费单价(元/度)',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备能耗表';

-- 初始化设备能耗数据
INSERT INTO `equipment_energy` (`equipment_code`, `equipment_name`, `process_type`, `power_rating`) VALUES
('CUTTING_001', '数控切割机', 'CUTTING', 15.5),
('STAMPING_001', '精密冲床', 'STAMPING', 22.0),
('WINDING_001', '线圈绕线机', 'WINDING', 8.5),
('ASSEMBLY_001', '组装流水线', 'ASSEMBLY', 12.0),
('TESTING_001', '通电测试台', 'TESTING', 5.0),
('DURABILITY_001', '耐久试验机', 'DURABILITY', 18.0);
