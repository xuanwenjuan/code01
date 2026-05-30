-- 物料表扩展字段
ALTER TABLE material ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价';
ALTER TABLE material ADD COLUMN lock_quantity DECIMAL(10,2) DEFAULT 0.00 COMMENT '锁定库存数量';

-- 物料库存锁定表
CREATE TABLE IF NOT EXISTS material_stock_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    batch_no VARCHAR(50) COMMENT '批次号',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    lock_type VARCHAR(20) COMMENT '锁定类型',
    status VARCHAR(20) DEFAULT 'LOCKED' COMMENT '状态：LOCKED-锁定,UNLOCKED-解锁,DEDUCTED-已扣减',
    lock_time DATETIME COMMENT '锁定时间',
    unlock_time DATETIME COMMENT '解锁时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料库存锁定表';

-- 物料入库记录表
CREATE TABLE IF NOT EXISTS material_inbound (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    inbound_no VARCHAR(50) UNIQUE NOT NULL COMMENT '入库单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    material_type VARCHAR(50) COMMENT '物料类型',
    batch_no VARCHAR(50) COMMENT '批次号',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    supplier VARCHAR(200) COMMENT '供应商',
    production_date DATE COMMENT '生产日期',
    quality_days INT COMMENT '保质期天数',
    status VARCHAR(20) DEFAULT 'COMPLETED' COMMENT '状态',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_inbound_no (inbound_no),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料入库记录表';

-- 残次品处理表
CREATE TABLE IF NOT EXISTS defect_handle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    work_order_no VARCHAR(50) COMMENT '工单号',
    handle_type VARCHAR(50) COMMENT '处理类型：REWORK-返工,SCRAP-报废,REPAIR-修复',
    handle_quantity INT NOT NULL COMMENT '处理数量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料损耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    total_loss DECIMAL(12,2) DEFAULT 0 COMMENT '总损耗',
    defect_reason VARCHAR(500) COMMENT '次品原因',
    handle_method VARCHAR(500) COMMENT '处理方式',
    status VARCHAR(20) DEFAULT 'COMPLETED' COMMENT '状态',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_handle_type (handle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='残次品处理表';

-- 生产损耗表
CREATE TABLE IF NOT EXISTS production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    loss_type VARCHAR(50) COMMENT '损耗类型：MATERIAL-原料,SAND-砂料,LABOR-人工,ENERGY-能耗',
    material_id BIGINT COMMENT '物料ID',
    material_name VARCHAR(100) COMMENT '物料名称',
    loss_quantity DECIMAL(10,2) COMMENT '损耗数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_cost DECIMAL(12,2) COMMENT '总金额',
    loss_reason VARCHAR(500) COMMENT '损耗原因',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_loss_type (loss_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗表';
