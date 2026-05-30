-- 创建数据库
CREATE DATABASE IF NOT EXISTS big_cargo_dispatch DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE big_cargo_dispatch;

-- 用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL COMMENT '角色：WAREHOUSE_ADMIN-仓储管理员,SORTER-分拣专员,DISPATCHER-调度员,DRIVER-配送员',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用,0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 货物品类表
DROP TABLE IF EXISTS biz_category;
CREATE TABLE biz_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '品类名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '品类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT DEFAULT 1 COMMENT '层级',
    sort INT DEFAULT 0 COMMENT '排序',
    priority INT DEFAULT 0 COMMENT '配送优先级：数字越大优先级越高',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用,0-禁用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_parent_id (parent_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='货物品类表';

-- 仓储货品表
DROP TABLE IF EXISTS biz_inventory;
CREATE TABLE biz_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库批次号',
    goods_name VARCHAR(200) NOT NULL COMMENT '货品名称',
    category_id BIGINT NOT NULL COMMENT '货物品类ID',
    specification VARCHAR(500) COMMENT '规格',
    weight DECIMAL(10,2) COMMENT '重量(吨)',
    volume DECIMAL(10,2) COMMENT '体积(立方米)',
    bearing_level INT COMMENT '承重等级：1-轻型,2-中型,3-重型,4-超重型',
    storage_zone VARCHAR(100) COMMENT '存放库区',
    protection_material VARCHAR(200) COMMENT '防护耗材',
    quantity INT DEFAULT 0 COMMENT '数量',
    stock_status INT DEFAULT 1 COMMENT '库存状态：1-正常库存,2-待分拣库存,3-临期调拨',
    fragile_flag TINYINT DEFAULT 0 COMMENT '易损标识：0-否,1-是',
    protection_expire_time DATETIME COMMENT '仓储防护到期时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_batch_no (batch_no),
    INDEX idx_category_id (category_id),
    INDEX idx_stock_status (stock_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓储货品表';

-- 车辆表
DROP TABLE IF EXISTS biz_vehicle;
CREATE TABLE biz_vehicle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    plate_no VARCHAR(20) NOT NULL UNIQUE COMMENT '车牌号',
    vehicle_type VARCHAR(50) COMMENT '车辆类型',
    load_capacity DECIMAL(10,2) COMMENT '载重(吨)',
    volume_capacity DECIMAL(10,2) COMMENT '容积(立方米)',
    status TINYINT DEFAULT 1 COMMENT '状态：1-空闲,2-配送中,3-维修中',
    driver_name VARCHAR(50) COMMENT '司机姓名',
    driver_phone VARCHAR(20) COMMENT '司机电话',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_plate_no (plate_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- 调度工单表
DROP TABLE IF EXISTS biz_dispatch_order;
CREATE TABLE biz_dispatch_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    inventory_id BIGINT COMMENT '库存ID',
    category_id BIGINT COMMENT '货物品类ID',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    pickup_address VARCHAR(500) COMMENT '取货地址',
    delivery_address VARCHAR(500) NOT NULL COMMENT '配送地址',
    distance DECIMAL(10,2) COMMENT '配送距离(公里)',
    vehicle_id BIGINT COMMENT '车辆ID',
    driver_id BIGINT COMMENT '司机ID',
    sorter_id BIGINT COMMENT '分拣员ID',
    order_status INT DEFAULT 1 COMMENT '工单状态：1-待入库,2-入库清点,3-库区存放,4-待分拣,5-分拣中,6-待派单,7-已派单,8-运输中,9-待签收,10-已完成,11-已搁置',
    priority INT DEFAULT 0 COMMENT '优先级：数字越大优先级越高',
    expect_arrive_time DATETIME COMMENT '预计送达时间',
    actual_arrive_time DATETIME COMMENT '实际送达时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_order_no (order_no),
    INDEX idx_order_status (order_status),
    INDEX idx_driver_id (driver_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调度工单表';

-- 操作日志表
DROP TABLE IF EXISTS sys_operation_log;
CREATE TABLE sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    operation_type VARCHAR(50) COMMENT '操作类型',
    business_no VARCHAR(50) COMMENT '业务编号',
    business_type VARCHAR(50) COMMENT '业务类型',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_content VARCHAR(1000) COMMENT '操作内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_business_no (business_no),
    INDEX idx_operator_id (operator_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 物流费用表
DROP TABLE IF EXISTS biz_logistics_cost;
CREATE TABLE biz_logistics_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    category_id BIGINT COMMENT '货物品类ID',
    storage_fee DECIMAL(12,2) DEFAULT 0 COMMENT '仓储占位费',
    sorting_fee DECIMAL(12,2) DEFAULT 0 COMMENT '分拣人工成本',
    transport_fee DECIMAL(12,2) DEFAULT 0 COMMENT '车辆运输能耗',
    loading_fee DECIMAL(12,2) DEFAULT 0 COMMENT '短途装卸损耗',
    damage_fee DECIMAL(12,2) DEFAULT 0 COMMENT '异常丢损赔付',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总费用',
    cost_month VARCHAR(10) COMMENT '费用月份：yyyy-MM',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_order_id (order_id),
    INDEX idx_cost_month (cost_month),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物流费用表';

-- 月度报表表
DROP TABLE IF EXISTS biz_monthly_report;
CREATE TABLE biz_monthly_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    report_month VARCHAR(10) NOT NULL COMMENT '报表月份：yyyy-MM',
    category_id BIGINT COMMENT '货物品类ID',
    category_name VARCHAR(100) COMMENT '货物品类名称',
    total_orders INT DEFAULT 0 COMMENT '总订单数',
    completed_orders INT DEFAULT 0 COMMENT '已完成订单数',
    total_storage_fee DECIMAL(12,2) DEFAULT 0 COMMENT '仓储占位费总计',
    total_sorting_fee DECIMAL(12,2) DEFAULT 0 COMMENT '分拣人工成本总计',
    total_transport_fee DECIMAL(12,2) DEFAULT 0 COMMENT '车辆运输能耗总计',
    total_loading_fee DECIMAL(12,2) DEFAULT 0 COMMENT '短途装卸损耗总计',
    total_damage_fee DECIMAL(12,2) DEFAULT 0 COMMENT '异常丢损赔付总计',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总费用',
    status TINYINT DEFAULT 1 COMMENT '状态：1-草稿,2-已确认',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除',
    INDEX idx_report_month (report_month),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度报表表';

-- 初始化用户数据（密码都是123456）
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800000000', 'WAREHOUSE_ADMIN', 1),
('sorter01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '分拣员张三', '13800000001', 'SORTER', 1),
('sorter02', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '分拣员李四', '13800000002', 'SORTER', 1),
('dispatcher01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '调度员王五', '13800000003', 'DISPATCHER', 1),
('driver01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '配送员赵六', '13800000004', 'DRIVER', 1),
('driver02', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '配送员钱七', '13800000005', 'DRIVER', 1);

-- 初始化货物品类数据
INSERT INTO biz_category (name, code, parent_id, level, sort, priority, status, remark) VALUES
('家电家具类', 'JDJJ', 0, 1, 1, 3, 1, '家电、家具类大件货品'),
('工业设备类', 'GYSB', 0, 1, 2, 2, 1, '工业设备类大件货品'),
('建材大件类', 'JCDJ', 0, 1, 3, 1, 1, '建材类大件货品'),
('生鲜整货类', 'SXZH', 0, 1, 4, 4, 1, '生鲜整货类大件货品');

INSERT INTO biz_category (name, code, parent_id, level, sort, priority, status, remark) VALUES
('大家电', 'DJD', 1, 2, 1, 3, 1, '电视、冰箱、洗衣机等'),
('小家电', 'XJD', 1, 2, 2, 2, 1, '微波炉、电饭煲等'),
('民用家具', 'MYJJ', 1, 2, 3, 3, 1, '床、沙发、衣柜等'),
('办公家具', 'BGJJ', 1, 2, 4, 2, 1, '办公桌、会议桌等');

INSERT INTO biz_category (name, code, parent_id, level, sort, priority, status, remark) VALUES
('生产设备', 'SCSB', 2, 2, 1, 2, 1, '生产线设备'),
('动力设备', 'DLSB', 2, 2, 2, 3, 1, '发电机、空压机等'),
('仪器仪表', 'YQYB', 2, 2, 3, 1, 1, '精密仪器设备');

INSERT INTO biz_category (name, code, parent_id, level, sort, priority, status, remark) VALUES
('水泥钢材', 'SNGC', 3, 2, 1, 1, 1, '水泥、钢材等建材'),
('木材板材', 'MCBC', 3, 2, 2, 1, 1, '木材、板材等'),
('陶瓷卫浴', 'TCWY', 3, 2, 3, 2, 1, '瓷砖、卫浴设备等');

INSERT INTO biz_category (name, code, parent_id, level, sort, priority, status, remark) VALUES
('冷冻食品', 'LDSP', 4, 2, 1, 5, 1, '需要冷冻保存的食品'),
('冷藏食品', 'LCSP', 4, 2, 2, 4, 1, '需要冷藏保存的食品'),
('鲜活水产', 'XHSC', 4, 2, 3, 5, 1, '鲜活水产品');

-- 初始化车辆数据
INSERT INTO biz_vehicle (plate_no, vehicle_type, load_capacity, volume_capacity, status, driver_name, driver_phone) VALUES
('京A12345', '4.2米厢货', 3.00, 18.00, 1, '赵六', '13800000004'),
('京A67890', '6.8米厢货', 8.00, 40.00, 1, '钱七', '13800000005'),
('京A11111', '9.6米厢货', 15.00, 65.00, 1, '孙八', '13800000006'),
('京A22222', '冷藏车', 5.00, 25.00, 1, '周九', '13800000007');
