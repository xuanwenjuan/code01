CREATE DATABASE IF NOT EXISTS aroma_supply DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aroma_supply;

CREATE TABLE `sys_user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `role` VARCHAR(20) NOT NULL COMMENT '角色：PERFUMER-调香师, BUYER-原料采购员, WAREHOUSE-仓储员, OPERATOR-渠道运营, ADMIN-管理员',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用, 1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除'
) COMMENT '用户表';

CREATE TABLE `aroma_category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
  `category_name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `category_code` VARCHAR(50) UNIQUE COMMENT '分类编码',
  `description` VARCHAR(500) COMMENT '分类描述',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `supply_sort` INT DEFAULT 0 COMMENT '渠道供货排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-停产下架, 1-正常',
  `level` INT DEFAULT 1 COMMENT '分类层级',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_status (`status`)
) COMMENT '香薰香型类目表';

CREATE TABLE `raw_material` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
  `batch_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '唯一批次编码',
  `material_name` VARCHAR(100) NOT NULL COMMENT '原料名称',
  `origin` VARCHAR(100) COMMENT '萃取产地',
  `extraction_process` VARCHAR(100) COMMENT '萃取工艺',
  `purity` DECIMAL(5,2) COMMENT '原液纯度',
  `shelf_life` INT COMMENT '保质期（天）',
  `production_date` DATE COMMENT '生产日期',
  `expiry_date` DATE COMMENT '过期日期',
  `stock_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量（ml）',
  `locked_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '锁定数量（ml）',
  `warning_quantity` DECIMAL(10,2) DEFAULT 100 COMMENT '库存预警阈值',
  `unit` VARCHAR(20) DEFAULT 'ml' COMMENT '单位',
  `unit_price` DECIMAL(10,2) COMMENT '单价（元/ml）',
  `stock_status` TINYINT DEFAULT 1 COMMENT '库存状态：0-不足, 1-充足, 2-盈余',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-过期停用, 1-正常, 2-临期',
  `remark` VARCHAR(500) COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  INDEX idx_batch_code (`batch_code`),
  INDEX idx_status (`status`),
  INDEX idx_extraction_process (`extraction_process`),
  INDEX idx_expiry_date (`expiry_date`)
) COMMENT '天然萃取原料档案表';

CREATE TABLE `production_work_order` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
  `customer_name` VARCHAR(100) COMMENT '客户名称',
  `aroma_name` VARCHAR(100) NOT NULL COMMENT '香薰名称',
  `category_id` BIGINT COMMENT '香型分类ID',
  `target_quantity` DECIMAL(10,2) COMMENT '目标产量（ml）',
  `actual_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '实际产量（ml）',
  `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待确认配方, FORMULA_CONFIRMED-配方已确认, MIXING-原液调和中, AGING-静置熟化中, QC_PASSED-质检通过, QC_FAILED-质检不合格, PACKAGED-已分装, SHIPPED-已出库, SUSPENDED-已暂停, CANCELLED-已取消',
  `is_locked` TINYINT DEFAULT 0 COMMENT '是否锁定库存：0-未锁定, 1-已锁定',
  `formula_confirmed_time` DATETIME COMMENT '配方确认时间',
  `mixing_start_time` DATETIME COMMENT '调和开始时间',
  `mixing_end_time` DATETIME COMMENT '调和结束时间',
  `aging_start_time` DATETIME COMMENT '熟化开始时间',
  `aging_end_time` DATETIME COMMENT '熟化结束时间',
  `qc_time` DATETIME COMMENT '质检时间',
  `qc_result` VARCHAR(500) COMMENT '质检结果',
  `package_time` DATETIME COMMENT '分装时间',
  `ship_time` DATETIME COMMENT '出库时间',
  `perfumer_id` BIGINT COMMENT '调香师ID',
  `warehouse_id` BIGINT COMMENT '仓储员ID',
  `total_material_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '原料总成本',
  `mixing_loss` DECIMAL(10,2) DEFAULT 0 COMMENT '调和损耗',
  `mixing_loss_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '调和损耗成本',
  `labor_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '人工调配费用',
  `total_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
  `remark` VARCHAR(500) COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  INDEX idx_order_no (`order_no`),
  INDEX idx_status (`status`),
  INDEX idx_create_time (`create_time`)
) COMMENT '定制调配生产工单表';

CREATE TABLE `work_order_formula` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配方明细ID',
  `work_order_id` BIGINT NOT NULL COMMENT '工单ID',
  `raw_material_id` BIGINT NOT NULL COMMENT '原料ID',
  `material_name` VARCHAR(100) COMMENT '原料名称（冗余）',
  `proportion` DECIMAL(5,2) NOT NULL COMMENT '配比（%）',
  `dosage` DECIMAL(10,2) NOT NULL COMMENT '用量（ml）',
  `actual_usage` DECIMAL(10,2) COMMENT '实际用量（ml）',
  `loss_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '损耗率（%）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  INDEX idx_work_order_id (`work_order_id`)
) COMMENT '工单配方明细表';

CREATE TABLE `cost_ledger` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '台账ID',
  `ledger_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '台账编号',
  `work_order_id` BIGINT COMMENT '关联工单ID',
  `category_id` BIGINT COMMENT '香型分类ID',
  `category_name` VARCHAR(100) COMMENT '分类名称',
  `material_origin` VARCHAR(100) COMMENT '原料产地',
  `total_material_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '原料总成本',
  `total_material_consumption` DECIMAL(10,2) DEFAULT 0 COMMENT '原料总消耗量',
  `mixing_loss` DECIMAL(10,2) DEFAULT 0 COMMENT '调和损耗量',
  `mixing_loss_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '调和损耗成本',
  `labor_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '人工调配费用',
  `total_cost` DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
  `supply_quantity` DECIMAL(10,2) DEFAULT 0 COMMENT '供货数量',
  `supply_price` DECIMAL(12,2) DEFAULT 0 COMMENT '供货总价',
  `profit` DECIMAL(12,2) DEFAULT 0 COMMENT '利润',
  `profit_margin` DECIMAL(5,2) DEFAULT 0 COMMENT '利润率（%）',
  `settlement_status` TINYINT DEFAULT 0 COMMENT '结算状态：0-未结算, 1-已结算',
  `settlement_time` DATETIME COMMENT '结算时间',
  `remark` VARCHAR(500) COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  INDEX idx_ledger_no (`ledger_no`),
  INDEX idx_work_order_id (`work_order_id`),
  INDEX idx_settlement_status (`settlement_status`)
) COMMENT '调配供货成本台账表';

CREATE TABLE `operation_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `operation_module` VARCHAR(50) COMMENT '操作模块',
  `operation_type` VARCHAR(50) COMMENT '操作类型',
  `operation_desc` VARCHAR(500) COMMENT '操作描述',
  `operation_user_id` BIGINT COMMENT '操作人ID',
  `operation_username` VARCHAR(50) COMMENT '操作人姓名',
  `request_method` VARCHAR(20) COMMENT '请求方法',
  `request_url` VARCHAR(200) COMMENT '请求URL',
  `request_param` TEXT COMMENT '请求参数',
  `response_result` TEXT COMMENT '响应结果',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-失败, 1-成功',
  `error_msg` TEXT COMMENT '错误信息',
  `cost_time` BIGINT COMMENT '耗时（毫秒）',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_operation_module (`operation_module`),
  INDEX idx_create_time (`create_time`)
) COMMENT '操作日志表';

INSERT INTO `sys_user` (`username`, `password`, `real_name`, `phone`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800000000', 'ADMIN', 1),
('perfumer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张调香师', '13800000001', 'PERFUMER', 1),
('buyer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李采购员', '13800000002', 'BUYER', 1),
('warehouse1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王仓储员', '13800000003', 'WAREHOUSE', 1),
('operator1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵运营', '13800000004', 'OPERATOR', 1);

INSERT INTO `aroma_category` (`parent_id`, `category_name`, `category_code`, `description`, `sort`, `supply_sort`, `status`, `level`) VALUES
(0, '自然花果香', 'NATURAL_FLOWER', '包含玫瑰、茉莉、柑橘等花果香型', 1, 1, 1, 1),
(0, '木质沉静香', 'WOODEN', '包含檀香、雪松、沉香等木质香型', 2, 2, 1, 1),
(0, '草本疗愈香', 'HERBAL', '包含薰衣草、茶树、薄荷等草本香型', 3, 3, 1, 1),
(0, '复合定制香', 'COMPOUND', '多种香型调和的定制香型', 4, 4, 1, 1),
(1, '玫瑰香调', 'ROSE', '纯正玫瑰萃取', 1, 1, 1, 2),
(1, '柑橘香调', 'CITRUS', '清新柑橘系列', 2, 2, 1, 2),
(2, '檀香', 'SANDALWOOD', '印度老山檀香', 1, 1, 1, 2),
(3, '薰衣草', 'LAVENDER', '普罗旺斯薰衣草', 1, 1, 1, 2);

INSERT INTO `raw_material` (`batch_code`, `material_name`, `origin`, `extraction_process`, `purity`, `shelf_life`, `production_date`, `expiry_date`, `stock_quantity`, `warning_quantity`, `unit`, `unit_price`, `stock_status`, `status`) VALUES
('RAW2024001', '玫瑰精油', '保加利亚', '蒸馏萃取', 99.50, 365, '2024-01-01', '2025-01-01', 5000.00, 500.00, 'ml', 0.50, 1, 1),
('RAW2024002', '檀香精油', '印度', '溶剂萃取', 98.00, 730, '2023-06-01', '2025-06-01', 3000.00, 300.00, 'ml', 0.80, 1, 1),
('RAW2024003', '薰衣草精油', '法国普罗旺斯', '超临界CO2萃取', 99.00, 545, '2024-03-01', '2025-09-01', 800.00, 1000.00, 'ml', 0.30, 0, 1),
('RAW2024004', '柑橘精油', '意大利', '冷压萃取', 97.50, 365, '2023-12-01', '2024-12-01', 1500.00, 500.00, 'ml', 0.20, 1, 2);
