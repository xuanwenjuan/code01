USE cosmetics_db;

INSERT INTO sys_user (username, password, real_name, phone, email, role, status) VALUES
('caigou', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', '13800138001', 'caigou@cosmetics.com', 1, 1),
('yanfa', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', '13800138002', 'yanfa@cosmetics.com', 2, 1),
('shengchan', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王五', '13800138003', 'shengchan@cosmetics.com', 3, 1),
('pinkong', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵六', '13800138004', 'pinkong@cosmetics.com', 4, 1),
('cangchu', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '钱七', '13800138005', 'cangchu@cosmetics.com', 5, 1);

INSERT INTO product_category (name, parent_id, level, sort_order, description) VALUES
('洗发护发类', 0, 1, 1, '洗发水、护发素、发膜等'),
('身体洗护类', 0, 1, 2, '沐浴露、身体乳、香皂等'),
('家居清洁类', 0, 1, 3, '洗衣液、洗洁精、清洁剂等'),
('美妆洗护小样', 0, 1, 4, '各类洗护产品小样'),
('洗发水', 1, 2, 1, '各类洗发水产品'),
('护发素', 1, 2, 2, '各类护发素产品'),
('沐浴露', 2, 2, 1, '各类沐浴露产品'),
('洗衣液', 3, 2, 1, '各类洗衣液产品');

INSERT INTO product (category_id, product_code, name, spec, unit, sales_priority, status) VALUES
(5, 'P001', '氨基酸洗发水', '500ml', '瓶', 10, 1),
(5, 'P002', '去屑止痒洗发水', '400ml', '瓶', 8, 1),
(6, 'P003', '滋养修护护发素', '500ml', '瓶', 9, 1),
(7, 'P004', '香氛沐浴露', '750ml', '瓶', 7, 1),
(8, 'P005', '温和洗衣液', '2kg', '瓶', 6, 1),
(8, 'P006', '除菌洗衣液', '3kg', '瓶', 5, 1);

INSERT INTO material (material_code, name, type, spec, unit, warning_stock, status, shelf_life, is_liquid) VALUES
('M001', '椰子油起泡剂', 2, '25kg/桶', 'kg', 100, 1, 365, 1),
('M002', '氨基酸表面活性剂', 2, '20kg/桶', 'kg', 80, 1, 540, 1),
('M003', '芦荟提取物', 1, '10kg/桶', 'kg', 30, 1, 180, 1),
('M004', '茶树精油', 1, '5kg/桶', 'kg', 10, 1, 720, 1),
('M005', '玫瑰香精', 3, '5kg/桶', 'kg', 5, 1, 365, 1),
('M006', '去离子水', 2, '1000kg/罐', 'kg', 500, 1, 90, 1),
('M007', 'PET塑料瓶', 4, '500ml', '个', 500, 1, 1095, 0),
('M008', '按压泵头', 4, '标准', '个', 600, 1, 1095, 0),
('M009', '标签贴纸', 4, '定制', '张', 1000, 1, 730, 0);

INSERT INTO formula (formula_code, name, product_id, version, output_quantity, output_unit, status, description) VALUES
('F001', '氨基酸洗发水配方V1.0', 1, 'V1.0', 1000, 'kg', 1, '基础氨基酸洗发水配方'),
('F002', '去屑洗发水配方V1.0', 2, 'V1.0', 1000, 'kg', 1, '含锌去屑成分配方');

INSERT INTO formula_detail (formula_id, material_id, dosage, dosage_unit, sort_order) VALUES
(1, 1, 120.0000, 'kg', 1),
(1, 2, 80.0000, 'kg', 2),
(1, 3, 20.0000, 'kg', 3),
(1, 5, 2.0000, 'kg', 4),
(1, 6, 778.0000, 'kg', 5),
(2, 1, 100.0000, 'kg', 1),
(2, 2, 90.0000, 'kg', 2),
(2, 4, 5.0000, 'kg', 3),
(2, 5, 1.5000, 'kg', 4),
(2, 6, 803.5000, 'kg', 5);

INSERT INTO material_batch (batch_no, material_id, quantity, remaining_quantity, unit_price, supplier, production_date, expiry_date, warehouse_time, operator_id) VALUES
('B202401001', 1, 500.00, 500.00, 25.00, '广州化工原料有限公司', '2024-01-15', '2025-01-14', '2024-01-20 10:00:00', 1),
('B202401002', 2, 400.00, 400.00, 45.00, '上海精细化工有限公司', '2024-01-10', '2025-07-09', '2024-01-20 11:00:00', 1),
('B202401003', 3, 100.00, 100.00, 120.00, '云南植物提取厂', '2024-01-05', '2024-07-04', '2024-01-20 14:00:00', 1),
('B202401004', 7, 2000.00, 2000.00, 2.50, '东莞塑胶制品厂', '2024-01-01', '2026-12-31', '2024-01-21 09:00:00', 1),
('B202401005', 8, 2500.00, 2500.00, 1.80, '深圳五金配件厂', '2024-01-01', '2026-12-31', '2024-01-21 09:30:00', 1);
