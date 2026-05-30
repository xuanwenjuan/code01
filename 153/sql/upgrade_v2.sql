-- ============================================
-- 物料预占表（新增）
-- ============================================
DROP TABLE IF EXISTS material_reservation;
CREATE TABLE material_reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    reservation_no VARCHAR(50) NOT NULL UNIQUE COMMENT '预占单号',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    quantity DECIMAL(12,2) NOT NULL COMMENT '预占数量',
    status TINYINT DEFAULT 1 COMMENT '状态：0已释放 1预占中 2已确认',
    expire_time DATETIME COMMENT '过期时间',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1已删除',
    INDEX idx_material_id (material_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_status (status),
    INDEX idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料预占表';

-- ============================================
-- 添加工单流程表字段（如果不存在）
-- ============================================
-- 注意：以下字段如果已存在可以跳过
-- ALTER TABLE work_order_process ADD COLUMN operator_id BIGINT COMMENT '操作人ID' AFTER process_name;
-- ALTER TABLE work_order_process ADD COLUMN duration INT COMMENT '耗时(分钟)' AFTER end_time;
-- ALTER TABLE work_order_process ADD COLUMN process_params TEXT COMMENT '工艺参数' AFTER duration;
-- ALTER TABLE work_order_process ADD COLUMN process_result TEXT COMMENT '处理结果' AFTER process_params;

-- ============================================
-- 初始化测试数据（可选）
-- ============================================
-- 可以在这里添加一些测试数据
