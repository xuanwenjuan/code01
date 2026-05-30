-- =========================================
-- 2026-05-17 升级脚本：添加工艺审核与原料预占功能
-- =========================================

-- 冷镦加工工单表增加审核和预占字段
ALTER TABLE cold_heading_work_order
    ADD COLUMN audit_status TINYINT DEFAULT 0 COMMENT '审核状态 0-待审核 1-审核通过 2-审核驳回' AFTER status,
    ADD COLUMN auditor VARCHAR(50) COMMENT '审核人' AFTER audit_status,
    ADD COLUMN audit_time DATETIME COMMENT '审核时间' AFTER auditor,
    ADD COLUMN audit_remark VARCHAR(500) COMMENT '审核意见' AFTER audit_time,
    ADD COLUMN material_reserved_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预占原料数量' AFTER material_usage,
    ADD COLUMN material_reserved_time DATETIME COMMENT '原料预占时间' AFTER material_reserved_quantity,
    ADD INDEX idx_audit_status (audit_status);

-- 原料库存批次表增加预占数量字段
ALTER TABLE material_batch
    ADD COLUMN reserved_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预占数量' AFTER available_quantity,
    ADD COLUMN reserved_order_count INT DEFAULT 0 COMMENT '占用工单数' AFTER reserved_quantity;

-- 原料预占记录表（新表）
CREATE TABLE IF NOT EXISTS material_reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    reservation_no VARCHAR(50) NOT NULL UNIQUE COMMENT '预占单号',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    batch_no VARCHAR(50) COMMENT '批次号',
    reserved_quantity DECIMAL(10,2) NOT NULL COMMENT '预占数量',
    actual_used_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '实际使用数量',
    status TINYINT DEFAULT 0 COMMENT '状态 0-预占中 1-已耗用 2-已释放',
    expire_time DATETIME COMMENT '预占失效时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_id (material_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料预占记录表';

-- 工单审核操作日志
ALTER TABLE operation_log
    MODIFY COLUMN operation_type TINYINT NOT NULL COMMENT '操作类型 1-新增 2-修改 3-删除 4-查询 5-状态变更 6-原料入库 7-原料出库 8-工单启动 9-工序流转 10-质检操作 11-成本核算 12-工艺审核 13-原料预占 14-预占释放';
