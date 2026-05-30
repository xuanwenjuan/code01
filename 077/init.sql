CREATE DATABASE IF NOT EXISTS equipment_rental DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE equipment_rental;

INSERT INTO users (username, password, realName, phone, email, role, status, createdAt, updatedAt)
VALUES 
('admin', '$2b$10$vJvQ6yFhZ0vK5Lz9X7W6Y5V4U3T2S1R0Q9P8O7N6M5', '超级管理员', '13800138000', 'admin@example.com', 'super_admin', 1, NOW(), NOW()),
('finance', '$2b$10$vJvQ6yFhZ0vK5Lz9X7W6Y5V4U3T2S1R0Q9P8O7N6M5', '财务人员', '13800138001', 'finance@example.com', 'finance', 1, NOW(), NOW()),
('operator', '$2b$10$vJvQ6yFhZ0vK5Lz9X7W6Y5V4U3T2S1R0Q9P8O7N6M5', '运营人员', '13800138002', 'operator@example.com', 'operator', 1, NOW(), NOW());

INSERT INTO categories (name, parentId, level, sort, status, createdAt, updatedAt)
VALUES 
('电脑办公', NULL, 1, 1, 1, NOW(), NOW()),
('台式机', 1, 2, 1, 1, NOW(), NOW()),
('笔记本', 1, 2, 2, 1, NOW(), NOW()),
('一体机', 1, 2, 3, 1, NOW(), NOW()),
('打印复印', NULL, 1, 2, 1, NOW(), NOW()),
('激光打印机', 5, 2, 1, 1, NOW(), NOW()),
('喷墨打印机', 5, 2, 2, 1, NOW(), NOW()),
('一体机复印机', 5, 2, 3, 1, NOW(), NOW()),
('投影会议', NULL, 1, 3, 1, NOW(), NOW()),
('投影仪', 9, 2, 1, 1, NOW(), NOW()),
('幕布', 9, 2, 2, 1, NOW(), NOW()),
('会议系统', 9, 2, 3, 1, NOW(), NOW()),
('网络设备', NULL, 1, 4, 1, NOW(), NOW()),
('路由器', 13, 2, 1, 1, NOW(), NOW()),
('交换机', 13, 2, 2, 1, NOW(), NOW()),
('防火墙', 13, 2, 3, 1, NOW(), NOW());
