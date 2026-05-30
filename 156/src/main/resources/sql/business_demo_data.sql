-- =============================================
-- 消防器材生产管控系统 - 业务流程演示数据
-- =============================================
-- 演示完整业务流程：物资入库 → 创建工单 → 领料生产 → 工序流转 → 成本核算
-- =============================================

-- =============================================
-- 1. 物资入库（采购专员：purchase / 123456）
-- =============================================
-- 首先为合金钢罐体创建入库批次
INSERT INTO material_batch (batch_code, material_id, material_code, material_name, quantity, available_quantity, production_date, expiry_date, quality_status, inspection_report, supplier, warehouse_location, recheck_date, recheck_status, create_time) VALUES
('MAT-003-20260517-A1B2C3', 3, 'MAT-003', '合金钢罐体', 200.00, 200.00, '2026-05-10', '2028-05-10', 1, '质检报告QR20260510001', '江苏五金厂', 'B区-01-01', '2026-11-13', 0, NOW());

-- 更新库存
UPDATE material SET total_stock = 1000.00, available_stock = 1000.00 WHERE id = 3;

-- 为ABC干粉原料入库
INSERT INTO material_batch (batch_code, material_id, material_code, material_name, quantity, available_quantity, production_date, expiry_date, quality_status, inspection_report, supplier, warehouse_location, create_time) VALUES
('MAT-001-20260517-D4E5F6', 1, 'MAT-001', 'ABC干粉原料', 1000.00, 1000.00, '2026-05-15', '2027-05-15', 1, '质检报告QR20260515001', '山东干粉厂', 'A区-01-01', NOW());

UPDATE material SET total_stock = 6000.00, available_stock = 6000.00 WHERE id = 1;

-- 为碳钢阀门入库
INSERT INTO material_batch (batch_code, material_id, material_code, material_name, quantity, available_quantity, production_date, expiry_date, quality_status, inspection_report, supplier, warehouse_location, recheck_date, recheck_status, create_time) VALUES
('MAT-004-20260517-G7H8I9', 4, 'MAT-004', '碳钢阀门', 300.00, 300.00, '2026-05-12', '2028-05-12', 1, '质检报告QR20260512001', '浙江阀门厂', 'B区-02-01', '2027-05-12', 0, NOW());

UPDATE material SET total_stock = 1500.00, available_stock = 1500.00 WHERE id = 4;

-- 为硅橡胶密封圈入库
INSERT INTO material_batch (batch_code, material_id, material_code, material_name, quantity, available_quantity, production_date, expiry_date, quality_status, inspection_report, supplier, warehouse_location, create_time) VALUES
('MAT-006-20260517-J0K1L2', 6, 'MAT-006', '硅橡胶密封圈', 1000.00, 1000.00, '2026-05-14', '2027-05-14', 1, '质检报告QR20260514001', '福建橡胶厂', 'C区-02-01', NOW());

UPDATE material SET total_stock = 6000.00, available_stock = 6000.00 WHERE id = 6;

-- =============================================
-- 2. 创建生产工单（工艺工程师：process / 123456）
-- =============================================
-- 创建100具干粉灭火器生产工单
INSERT INTO work_order (order_no, product_id, product_name, category_id, category_name, plan_quantity, qualified_quantity, scrap_quantity, plan_start_time, plan_end_time, priority, status, current_process, create_time, create_by) VALUES
('WO20260517001', 5, '干粉灭火器', '1', '灭火器材', 100.00, 0.00, 0.00, '2026-05-18 08:00:00', '2026-05-20 18:00:00', 1, 0, '待排产', NOW(), 3);

-- 配置工单工序
INSERT INTO work_order_process (work_order_id, order_no, process_code, process_name, process_sort, status, create_time) VALUES
(1, 'WO20260517001', 'STAMPING', '罐体冲压成型', 1, 0, NOW()),
(1, 'WO20260517001', 'SEALING', '耐压密封处理', 2, 0, NOW()),
(1, 'WO20260517001', 'FILLING', '灭火剂灌装', 3, 0, NOW()),
(1, 'WO20260517001', 'VALVE_ASSEMBLY', '阀门组装调试', 4, 0, NOW()),
(1, 'WO20260517001', 'FIRE_TEST', '防火性能检测', 5, 0, NOW()),
(1, 'WO20260517001', 'PRESSURE_TEST', '压力试压核验', 6, 0, NOW()),
(1, 'WO20260517001', 'LABELING', '防伪贴标', 7, 0, NOW()),
(1, 'WO20260517001', 'WAREHOUSING', '成品入库', 8, 0, NOW());

-- 配置工单物料
INSERT INTO work_order_material (work_order_id, order_no, material_id, material_code, material_name, specification, unit, required_quantity, picked_quantity, actual_quantity, returned_quantity, scrap_quantity, create_time) VALUES
(1, 'WO20260517001', 3, 'MAT-003', '合金钢罐体', '2mm厚度', '个', 100.00, 0.00, 0.00, 0.00, 0.00, NOW()),
(1, 'WO20260517001', 1, 'MAT-001', 'ABC干粉原料', '50kg/袋', 'kg', 500.00, 0.00, 0.00, 0.00, 0.00, NOW()),
(1, 'WO20260517001', 4, 'MAT-004', '碳钢阀门', 'DN15', '个', 100.00, 0.00, 0.00, 0.00, 0.00, NOW()),
(1, 'WO20260517001', 6, 'MAT-006', '硅橡胶密封圈', 'Φ50×3', '个', 100.00, 0.00, 0.00, 0.00, 0.00, NOW()),
(1, 'WO20260517001', 7, 'MAT-007', '压力表', 'Y-60 2.5MPa', '个', 100.00, 0.00, 0.00, 0.00, 0.00, NOW());

-- =============================================
-- 3. 开始生产（生产主管：production / 123456）
-- 假设此时已通过POST /api/work-order/process/start 开始了第一道工序
-- =============================================

-- 工单领料 - 合金钢罐体
INSERT INTO material_stock_record (record_no, record_type, material_id, material_code, material_name, batch_id, batch_code, quantity, before_quantity, after_quantity, work_order_id, order_no, operator_name, operate_time, remark, create_time) VALUES
('OUT20260518083000A1B2', 2, 3, 'MAT-003', '合金钢罐体', 1, 'MAT-003-20260517-A1B2C3', 100.00, 1000.00, 900.00, 1, 'WO20260517001', '生产主管', '2026-05-18 08:30:00', '工单领料', NOW());

UPDATE material_batch SET available_quantity = 100.00 WHERE id = 1;
UPDATE material SET available_stock = 900.00, frozen_stock = 100.00 WHERE id = 3;
UPDATE work_order_material SET picked_quantity = 100.00 WHERE id = 1;

-- 工单领料 - ABC干粉原料
INSERT INTO material_stock_record (record_no, record_type, material_id, material_code, material_name, batch_id, batch_code, quantity, before_quantity, after_quantity, work_order_id, order_no, operator_name, operate_time, remark, create_time) VALUES
('OUT20260518083500C3D4', 2, 1, 'MAT-001', 'ABC干粉原料', 2, 'MAT-001-20260517-D4E5F6', 500.00, 6000.00, 5500.00, 1, 'WO20260517001', '生产主管', '2026-05-18 08:35:00', '工单领料', NOW());

UPDATE material_batch SET available_quantity = 500.00 WHERE id = 2;
UPDATE material SET available_stock = 5500.00, frozen_stock = 500.00 WHERE id = 1;
UPDATE work_order_material SET picked_quantity = 500.00 WHERE id = 2;

-- =============================================
-- 4. 模拟工单完成（8道工序全部完成）
-- =============================================
-- 更新工单状态
UPDATE work_order SET
    status = 4,
    actual_start_time = '2026-05-18 08:00:00',
    actual_end_time = '2026-05-20 16:30:00',
    actual_quantity = 98.00,
    qualified_quantity = 96.00,
    scrap_quantity = 2.00,
    current_process = '已完成',
    production_user_id = 4,
    production_user_name = '生产主管',
    quality_user_id = 5,
    quality_user_name = '质检专员',
    update_time = NOW()
WHERE id = 1;

-- 更新工序状态（全部完成）
UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-18 08:00:00',
    end_time = '2026-05-18 12:00:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '合格',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 1;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-18 13:00:00',
    end_time = '2026-05-18 17:00:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '合格',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 2;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-19 08:00:00',
    end_time = '2026-05-19 12:00:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '合格',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 3;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-19 13:00:00',
    end_time = '2026-05-19 17:00:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '合格',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 4;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-20 08:00:00',
    end_time = '2026-05-20 10:00:00',
    operator_id = 5,
    operator_name = '质检专员',
    inspection_result = '全部合格',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 5;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-20 10:30:00',
    end_time = '2026-05-20 12:30:00',
    operator_id = 5,
    operator_name = '质检专员',
    inspection_result = '试压合格 96具，报废2具',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 6;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-20 13:30:00',
    end_time = '2026-05-20 15:00:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '贴标完成',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 7;

UPDATE work_order_process SET
    status = 2,
    start_time = '2026-05-20 15:30:00',
    end_time = '2026-05-20 16:30:00',
    operator_id = 4,
    operator_name = '生产主管',
    inspection_result = '入库96具',
    update_time = NOW()
WHERE work_order_id = 1 AND process_sort = 8;

-- 更新物料实际用量
UPDATE work_order_material SET actual_quantity = 100.00, scrap_quantity = 2.00 WHERE id = 1;
UPDATE work_order_material SET actual_quantity = 480.00, returned_quantity = 20.00 WHERE id = 2;
UPDATE work_order_material SET actual_quantity = 98.00, returned_quantity = 2.00 WHERE id = 3;
UPDATE work_order_material SET actual_quantity = 98.00, scrap_quantity = 2.00 WHERE id = 4;
UPDATE work_order_material SET actual_quantity = 96.00, scrap_quantity = 4.00 WHERE id = 5;

-- 物料退库 - 干粉原料
INSERT INTO material_stock_record (record_no, record_type, material_id, material_code, material_name, batch_id, batch_code, quantity, before_quantity, after_quantity, work_order_id, order_no, operator_name, operate_time, remark, create_time) VALUES
('RET20260520170000E5F6', 3, 1, 'MAT-001', 'ABC干粉原料', 2, 'MAT-001-20260517-D4E5F6', 20.00, 5500.00, 5520.00, 1, 'WO20260517001', '生产主管', '2026-05-20 17:00:00', '工单退料', NOW());

UPDATE material_batch SET available_quantity = 520.00 WHERE id = 2;
UPDATE material SET available_stock = 5520.00, frozen_stock = 480.00 WHERE id = 1;

-- =============================================
-- 5. 成本核算（系统管理员：admin / 123456）
-- =============================================
INSERT INTO production_cost (cost_no, work_order_id, order_no, product_id, product_name, category_name, production_quantity, material_cost, equipment_cost, energy_cost, labor_cost, scrap_cost, total_cost, unit_cost, cost_date, cost_period, remark, create_time) VALUES
('COST20260520001', 1, 'WO20260517001', 5, '干粉灭火器', '灭火器材', 96.00, 10584.00, 480.00, 240.00, 2880.00, 441.00, 14625.00, 152.34, '2026-05-20', '2026-05', '自动核算', NOW());

-- =============================================
-- 数据说明
-- =============================================
-- 成本构成说明：
-- - 主材成本：合金钢罐体100个×45元 + 干粉480kg×8.5元 + 阀门98个×28元 + 密封圈98个×2.5元 + 压力表96个×18元 = 10,584元
-- - 设备损耗：冲压机、灌装机等设备折旧 = 480元
-- - 水电能耗：生产期间水电消耗 = 240元
-- - 人工工时：3人×2天×480元/人/天 = 2,880元
-- - 报废成本：2个罐体×45元 + 2个阀门×28元 + 2个密封圈×2.5元 + 4个压力表×18元 + 20kg干粉×8.5元 = 441元
-- - 总成本：14,625元
-- - 单位成本：14,625 ÷ 96 = 152.34元/具
