-- 原料库存锁定表
CREATE TABLE IF NOT EXISTS material_lock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '锁定ID',
    lock_no VARCHAR(50) UNIQUE NOT NULL COMMENT '锁定单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    lock_quantity DECIMAL(10,2) NOT NULL COMMENT '锁定数量',
    lock_status TINYINT DEFAULT 1 COMMENT '锁定状态:1-已锁定,2-已释放,3-已消耗',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料库存锁定表';

-- 生产损耗记录表
CREATE TABLE IF NOT EXISTS production_loss (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '损耗ID',
    loss_no VARCHAR(50) UNIQUE NOT NULL COMMENT '损耗单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    category_id BIGINT COMMENT '分类ID',
    category_name VARCHAR(100) COMMENT '分类名称',
    loss_type TINYINT NOT NULL COMMENT '损耗类型:1-材料损耗,2-设备损耗,3-人工损耗,4-次品损耗,5-其他损耗',
    loss_name VARCHAR(100) COMMENT '损耗名称',
    loss_quantity DECIMAL(10,2) COMMENT '损耗数量',
    loss_amount DECIMAL(12,2) NOT NULL COMMENT '损耗金额',
    loss_rate DECIMAL(5,2) COMMENT '损耗率(%)',
    unit_price DECIMAL(10,2) COMMENT '单价',
    handler_id BIGINT COMMENT '处理人ID',
    handler_name VARCHAR(50) COMMENT '处理人姓名',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_loss_type (loss_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产损耗记录表';

-- 工单原料领用明细表
CREATE TABLE IF NOT EXISTS order_material_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    detail_no VARCHAR(50) UNIQUE NOT NULL COMMENT '明细单号',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    material_code VARCHAR(50) COMMENT '原料编码',
    batch_no VARCHAR(50) COMMENT '批次号',
    material_type TINYINT COMMENT '原料类型',
    spec VARCHAR(200) COMMENT '规格',
    receive_quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    actual_usage DECIMAL(10,2) DEFAULT 0 COMMENT '实际用量',
    return_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '退回数量',
    loss_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '损耗数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(12,2) COMMENT '总金额',
    receiver_id BIGINT COMMENT '领用人ID',
    receiver_name VARCHAR(50) COMMENT '领用人姓名',
    status TINYINT DEFAULT 1 COMMENT '状态:1-已领用,2-部分使用,3-已完成',
    remark VARCHAR(500) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单原料领用明细表';

-- 为material表添加材质字段
ALTER TABLE material ADD COLUMN material_texture VARCHAR(100) COMMENT '材质' AFTER material_type;

-- 为production_order表添加工艺确认字段
ALTER TABLE production_order ADD COLUMN process_confirmed TINYINT DEFAULT 0 COMMENT '工艺是否确认:0-未确认,1-已确认' AFTER inspector_name;
ALTER TABLE production_order ADD COLUMN process_engineer_time DATETIME COMMENT '工艺确认时间' AFTER process_confirmed;
