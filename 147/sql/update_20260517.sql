-- =============================================
-- 数据库更新脚本 - 2026-05-17
-- 功能：原料材质字段、库存锁定、单品成本核算
-- =============================================

-- 1. 为原料表添加材质字段
ALTER TABLE raw_material ADD COLUMN material_texture VARCHAR(50) COMMENT '原料材质：PE、PP、PVC、纯棉、涤纶、牛皮纸、铜版纸、食品级等' AFTER material_type;

-- 2. 为原料库存表添加锁定数量字段
ALTER TABLE raw_material_stock ADD COLUMN locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已锁定数量（生产工单占用）' AFTER quantity;

-- 3. 为工单用料表添加锁定状态字段
ALTER TABLE work_order_material ADD COLUMN locked_status TINYINT DEFAULT 0 COMMENT '锁定状态：0-未锁定 1-已锁定' AFTER status;
ALTER TABLE work_order_material ADD COLUMN locked_time DATETIME COMMENT '锁定时间' AFTER locked_status;

-- 4. 为产品表添加成本核算相关字段
ALTER TABLE product ADD COLUMN standard_material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '标准材料成本' AFTER cost_price;
ALTER TABLE product ADD COLUMN standard_labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '标准人工成本' AFTER standard_material_cost;
ALTER TABLE product ADD COLUMN standard_overhead_cost DECIMAL(10,2) DEFAULT 0 COMMENT '标准制造费用' AFTER standard_labor_cost;
ALTER TABLE product ADD COLUMN standard_work_hours DECIMAL(10,2) DEFAULT 0 COMMENT '单位标准工时（小时）' AFTER standard_overhead_cost;

-- 5. 创建单品生产成本表
DROP TABLE IF EXISTS product_cost;
CREATE TABLE product_cost (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    statistics_month VARCHAR(7) COMMENT '统计月份：yyyy-MM',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    qualified_quantity INT DEFAULT 0 COMMENT '合格数量',
    defective_quantity INT DEFAULT 0 COMMENT '次品数量',
    actual_material_cost DECIMAL(10,2) DEFAULT 0 COMMENT '实际材料成本',
    actual_labor_cost DECIMAL(10,2) DEFAULT 0 COMMENT '实际人工成本',
    actual_equipment_cost DECIMAL(10,2) DEFAULT 0 COMMENT '实际设备损耗成本',
    actual_packaging_cost DECIMAL(10,2) DEFAULT 0 COMMENT '实际包装成本',
    defective_scrap_cost DECIMAL(10,2) DEFAULT 0 COMMENT '次品报废成本',
    other_cost DECIMAL(10,2) DEFAULT 0 COMMENT '其他成本',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(10,4) DEFAULT 0 COMMENT '单位成本',
    material_loss_rate DECIMAL(5,2) DEFAULT 0 COMMENT '材料损耗率(%)',
    defective_rate DECIMAL(5,2) DEFAULT 0 COMMENT '次品率(%)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-否 1-是',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_statistics_month (statistics_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单品生产成本表';

-- 6. 初始化原料材质测试数据
UPDATE raw_material SET material_texture = 'PE' WHERE material_type = '塑料颗粒' AND material_texture IS NULL;
UPDATE raw_material SET material_texture = '纯棉' WHERE material_type = '纯棉布料' AND material_texture IS NULL;
UPDATE raw_material SET material_texture = '牛皮纸' WHERE material_type = '纸质原料' AND material_texture IS NULL;
UPDATE raw_material SET material_texture = '食品级' WHERE material_type = '日化助剂' AND material_texture IS NULL;
UPDATE raw_material SET material_texture = '铜版纸' WHERE material_type = '外包装纸箱' AND material_texture IS NULL;

-- 7. 初始化产品标准成本测试数据
UPDATE product SET 
    standard_material_cost = cost_price * 0.6,
    standard_labor_cost = cost_price * 0.25,
    standard_overhead_cost = cost_price * 0.15,
    standard_work_hours = 0.5
WHERE standard_material_cost IS NULL OR standard_material_cost = 0;
