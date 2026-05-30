-- 为库存表添加锁定数量字段
ALTER TABLE material_inventory ADD COLUMN locked_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '锁定数量' AFTER max_quantity;

-- 库存流水表
DROP TABLE IF EXISTS inventory_flow;
CREATE TABLE inventory_flow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '流水ID',
    inventory_id BIGINT NOT NULL COMMENT '库存ID',
    material_name VARCHAR(100) COMMENT '材料名称',
    specification VARCHAR(200) COMMENT '规格',
    unit VARCHAR(20) COMMENT '单位',
    batch_no VARCHAR(50) COMMENT '批次号',
    flow_type TINYINT NOT NULL COMMENT '流水类型：1-采购入库，2-调拨入库，3-盘盈入库，11-领用出库，12-调拨出库，13-盘亏出库，14-损耗出库',
    flow_type_name VARCHAR(50) COMMENT '流水类型名称',
    before_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '变动前数量',
    change_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '变动数量',
    after_quantity DECIMAL(18,2) DEFAULT 0 COMMENT '变动后数量',
    unit_price DECIMAL(18,2) DEFAULT 0 COMMENT '单价',
    change_amount DECIMAL(18,2) DEFAULT 0 COMMENT '变动金额',
    related_order_no VARCHAR(50) COMMENT '关联单号',
    warehouse VARCHAR(50) COMMENT '仓库',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    create_by BIGINT COMMENT '创建人',
    INDEX idx_inventory_id (inventory_id),
    INDEX idx_flow_type (flow_type),
    INDEX idx_warehouse (warehouse),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存流水表';

-- 添加示例库存数据
INSERT INTO material_inventory (category_id, category_name, material_name, material_code, specification, unit, quantity, unit_price, total_amount, batch_no, supplier, warehouse, location, production_date, moisture_proof_days, warning_quantity, max_quantity, locked_quantity, inventory_status, create_time, update_time, create_by, update_by, deleted) VALUES
(5, '螺纹钢', 'HRB400螺纹钢', 'HRB400-12', 'Φ12mm', '吨', 50.00, 4500.00, 225000.00, 'BATCH-20260517-ABC12345', '鞍山钢铁', '主仓库A区', 'A-01-01', '2026-05-01 00:00:00', NULL, 5.00, 100.00, 12.00, 1, NOW(), NOW(), 1, 1, 0),
(5, '螺纹钢', 'HRB400螺纹钢', 'HRB400-16', 'Φ16mm', '吨', 35.00, 4600.00, 161000.00, 'BATCH-20260517-DEF67890', '鞍山钢铁', '主仓库A区', 'A-01-02', '2026-05-05 00:00:00', NULL, 5.00, 80.00, 8.50, 1, NOW(), NOW(), 1, 1, 0),
(8, '硅酸盐水泥', 'P.O 42.5硅酸盐水泥', 'CEMENT-PO425', 'P.O 42.5', '吨', 80.00, 580.00, 46400.00, 'BATCH-20260517-GHI11111', '海螺水泥', '防潮仓库', 'B-01-01', '2026-05-10 00:00:00', 90, 10.00, 200.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(9, '河沙', '建筑用河沙', 'SAND-RIVER', '中沙', '立方米', 150.00, 120.00, 18000.00, 'BATCH-20260517-JKL22222', '本地砂石场', '露天堆场', 'C-01-01', '2026-05-12 00:00:00', NULL, 20.00, 500.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(10, '碎石', '建筑用碎石', 'GRAVEL-20', '20-40mm', '立方米', 100.00, 85.00, 8500.00, 'BATCH-20260517-MNO33333', '本地砂石场', '露天堆场', 'C-02-01', '2026-05-12 00:00:00', NULL, 15.00, 300.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(11, 'PVC管材', 'PVC-U排水管', 'PVC-DN110', 'DN110', '米', 500.00, 28.50, 14250.00, 'BATCH-20260517-PQR44444', '联塑管道', '管材仓库', 'D-01-01', '2026-04-01 00:00:00', NULL, 50.00, 1000.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(11, 'PVC管材', 'PVC-U给水管', 'PVC-DN75', 'DN75', '米', 300.00, 18.00, 5400.00, 'BATCH-20260517-STU55555', '联塑管道', '管材仓库', 'D-01-02', '2026-04-10 00:00:00', NULL, 30.00, 800.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(12, 'PPR管材', 'PPR热水管', 'PPR-DN25', 'DN25', '米', 800.00, 12.50, 10000.00, 'BATCH-20260517-VWX66666', '伟星管业', '管材仓库', 'D-02-01', '2026-04-15 00:00:00', NULL, 100.00, 2000.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(13, '电线电缆', 'BVV铜芯线', 'CABLE-BVV25', '2.5mm²', '米', 2000.00, 3.20, 6400.00, 'BATCH-20260517-YZA77777', '远东电缆', '电器仓库', 'E-01-01', '2026-03-01 00:00:00', NULL, 200.00, 5000.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(14, '防水材料', 'SBS改性沥青防水卷材', 'WATER-SBS', '4mm厚', '平方米', 1000.00, 45.00, 45000.00, 'BATCH-20260517-BCD88888', '东方雨虹', '防水仓库', 'F-01-01', '2026-02-01 00:00:00', NULL, 100.00, 2000.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(15, '保温材料', '挤塑聚苯板', 'INSULATION-XPS', '50mm厚', '平方米', 800.00, 32.00, 25600.00, 'BATCH-20260517-EFG99999', '北新建材', '保温仓库', 'G-01-01', '2026-03-15 00:00:00', NULL, 80.00, 1500.00, 0.00, 1, NOW(), NOW(), 1, 1, 0),
(8, '硅酸盐水泥', 'P.O 52.5硅酸盐水泥', 'CEMENT-PO525', 'P.O 52.5', '吨', 25.00, 620.00, 15500.00, 'BATCH-20260517-HIJA00000', '海螺水泥', '防潮仓库', 'B-01-02', '2026-05-15 00:00:00', 90, 5.00, 50.00, 0.00, 2, NOW(), NOW(), 1, 1, 0),
(9, '河沙', '建筑用河沙', 'SAND-RIVER-FINE', '细沙', '立方米', 15.00, 130.00, 1950.00, 'BATCH-20260517-KLMB00000', '本地砂石场', '露天堆场', 'C-01-02', '2026-05-16 00:00:00', NULL, 20.00, 100.00, 0.00, 2, NOW(), NOW(), 1, 1, 0);

-- 添加示例工单数据
INSERT INTO material_work_order (order_no, order_type, order_type_name, project_name, construction_team, team_leader, team_leader_phone, plan_use_date, status, status_name, total_quantity, total_amount, used_quantity, returned_quantity, lost_quantity, auditor, audit_time, audit_remark, warehouse_keeper, remark, create_time, update_time, create_by, update_by, deleted) VALUES
('WO-20260515-AAAA1111', 2, '班组领用', '市民中心项目', '主体施工一队', '张建国', '13800138001', '2026-05-18 00:00:00', 1, '待审核', 8.50, 38250.00, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, '1号楼3层墙体浇筑', NOW(), NOW(), 4, 4, 0),
('WO-20260514-BBBB2222', 2, '班组领用', '市民中心项目', '主体施工二队', '李明强', '13800138002', '2026-05-16 00:00:00', 2, '已审核', 12.00, 55200.00, 0.00, 0.00, 0.00, '王五', '2026-05-14 14:30:00', '材料充足，同意领用', NULL, '2号楼2层梁柱浇筑', NOW(), NOW(), 4, 4, 0),
('WO-20260513-CCCC3333', 2, '班组领用', '市民中心项目', '水电安装队', '赵伟', '13800138003', '2026-05-15 00:00:00', 3, '已出库', 600.00, 13200.00, 0.00, 0.00, 0.00, '王五', '2026-05-13 10:00:00', '水电材料领用', '李四', '3号楼水电预埋', NOW(), NOW(), 4, 4, 0),
('WO-20260512-DDDD4444', 2, '班组领用', '市民中心项目', '防水施工队', '孙有才', '13800138004', '2026-05-12 00:00:00', 4, '已核销', 500.00, 22500.00, 480.00, 15.00, 5.00, '王五', '2026-05-12 09:00:00', '防水材料领用', '李四', '地下车库顶板防水', NOW(), NOW(), 4, 4, 0),
('WO-20260510-EEEE5555', 2, '班组领用', '科技园区项目', '主体施工一队', '张建国', '13800138001', '2026-05-11 00:00:00', 4, '已核销', 25.00, 115000.00, 24.50, 0.00, 0.50, '王五', '2026-05-10 11:00:00', '钢筋领用', '李四', 'A栋基础承台', NOW(), NOW(), 4, 4, 0),
('WO-20260508-FFFF6666', 2, '班组领用', '科技园区项目', '装饰施工队', '钱多多', '13800138005', '2026-05-09 00:00:00', 4, '已核销', 300.00, 9600.00, 290.00, 8.00, 2.00, '王五', '2026-05-08 15:00:00', '保温材料领用', '李四', 'B栋外墙保温', NOW(), NOW(), 4, 4, 0);

-- 添加工单明细数据
INSERT INTO work_order_detail (work_order_id, inventory_id, category_id, category_name, material_name, specification, unit, plan_quantity, actual_quantity, unit_price, total_amount, used_quantity, returned_quantity, lost_quantity, batch_no, remark, create_time, update_time, create_by, update_by, deleted) VALUES
(1, 1, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ12mm', '吨', 5.00, NULL, 4500.00, 22500.00, NULL, NULL, NULL, 'BATCH-20260517-ABC12345', '墙体钢筋', NOW(), NOW(), 4, 4, 0),
(1, 2, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ16mm', '吨', 3.50, NULL, 4600.00, 16100.00, NULL, NULL, NULL, 'BATCH-20260517-DEF67890', '梁柱钢筋', NOW(), NOW(), 4, 4, 0),
(2, 1, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ12mm', '吨', 7.00, NULL, 4500.00, 31500.00, NULL, NULL, NULL, 'BATCH-20260517-ABC12345', '2号楼钢筋', NOW(), NOW(), 4, 4, 0),
(2, 2, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ16mm', '吨', 5.00, NULL, 4600.00, 23000.00, NULL, NULL, NULL, 'BATCH-20260517-DEF67890', '2号楼钢筋', NOW(), NOW(), 4, 4, 0),
(3, 6, 11, 'PVC管材', 'PVC-U排水管', 'DN110', '米', 300.00, 300.00, 28.50, 8550.00, NULL, NULL, NULL, 'BATCH-20260517-PQR44444', '排水管道', NOW(), NOW(), 4, 4, 0),
(3, 7, 11, 'PVC管材', 'PVC-U给水管', 'DN75', '米', 300.00, 300.00, 18.00, 5400.00, NULL, NULL, NULL, 'BATCH-20260517-STU55555', '给水管道', NOW(), NOW(), 4, 4, 0),
(4, 10, 14, '防水材料', 'SBS改性沥青防水卷材', '4mm厚', '平方米', 500.00, 500.00, 45.00, 22500.00, 480.00, 15.00, 5.00, 'BATCH-20260517-BCD88888', '车库顶板防水', NOW(), NOW(), 4, 4, 0),
(5, 1, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ12mm', '吨', 15.00, 15.00, 4500.00, 67500.00, 14.80, 0.00, 0.20, 'BATCH-20260517-ABC12345', '基础承台钢筋', NOW(), NOW(), 4, 4, 0),
(5, 2, 5, '螺纹钢', 'HRB400螺纹钢', 'Φ16mm', '吨', 10.00, 10.00, 4600.00, 46000.00, 9.70, 0.00, 0.30, 'BATCH-20260517-DEF67890', '基础承台钢筋', NOW(), NOW(), 4, 4, 0),
(6, 11, 15, '保温材料', '挤塑聚苯板', '50mm厚', '平方米', 300.00, 300.00, 32.00, 9600.00, 290.00, 8.00, 2.00, 'BATCH-20260517-EFG99999', '外墙保温', NOW(), NOW(), 4, 4, 0);
