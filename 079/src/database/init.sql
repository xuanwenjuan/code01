-- 创建数据库
CREATE DATABASE IF NOT EXISTS gift_wholesale DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gift_wholesale;

-- 注意：表结构将由 Sequelize 自动创建
-- 以下为初始化数据示例

-- 初始化管理员用户
-- 密码: admin123 (经过 bcrypt 加密)
-- INSERT INTO users (username, password, realName, phone, email, role, status, createdAt, updatedAt)
-- VALUES ('admin', '$2a$10$...', '系统管理员', '13800138000', 'admin@example.com', 'admin', 1, NOW(), NOW());
