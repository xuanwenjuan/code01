CREATE DATABASE IF NOT EXISTS extrusion_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE extrusion_db;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role INT COMMENT '角色:1采购员,2工艺员,3班组长,4质检员,5管理员',
    status INT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL COMMENT '类目名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    level INT COMMENT '层级',
    category_code VARCHAR(50) COMMENT '类目编码',
    description VARCHAR(500) COMMENT '描述',
    priority INT DEFAULT 0 COMMENT '优先级',
    status INT DEFAULT 1 COMMENT '状态:0下线,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品类目表';

CREATE TABLE IF NOT EXISTS aluminum_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    material_type INT COMMENT '原料类型:1铝棒,2铝材,3助剂',
    alloy_grade VARCHAR(50) COMMENT '合金牌号',
    specification VARCHAR(100) COMMENT '规格型号',
    quantity DECIMAL(10,2) COMMENT '库存数量',
    locked_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '锁定数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '单位',
    warning_quantity DECIMAL(10,2) COMMENT '预警值',
    stock_status INT COMMENT '库存状态:1充足,2预警,3停止采购',
    storage_location VARCHAR(100) COMMENT '存放位置',
    production_date DATE COMMENT '生产日期',
    oxidation_warning_date DATE COMMENT '氧化预警日期',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='铝棒原料库存表';

CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单号',
    category_id BIGINT COMMENT '产品类目ID',
    category_name VARCHAR(100) COMMENT '产品类目名称',
    stock_id BIGINT COMMENT '原料库存ID',
    batch_no VARCHAR(50) COMMENT '原料批次号',
    alloy_grade VARCHAR(50) COMMENT '合金牌号',
    plan_quantity DECIMAL(10,2) COMMENT '计划产量',
    actual_quantity DECIMAL(10,2) COMMENT '实际产量',
    scrap_quantity DECIMAL(10,2) COMMENT '报废数量',
    heating_loss DECIMAL(10,2) DEFAULT 0 COMMENT '加热损耗',
    extrusion_loss DECIMAL(10,2) DEFAULT 0 COMMENT '挤压损耗',
    cutting_loss DECIMAL(10,2) DEFAULT 0 COMMENT '切割损耗',
    surface_loss DECIMAL(10,2) DEFAULT 0 COMMENT '表面处理损耗',
    status INT COMMENT '状态:1待生产,2预热中,3挤压中,4冷却中,5切割中,6精切中,7氧化中,8分拣中,9已完成,10已暂停',
    extrusion_process VARCHAR(200) COMMENT '挤压工艺方案',
    mold_code VARCHAR(50) COMMENT '模具编号',
    heating_temp DECIMAL(6,2) COMMENT '加热温度',
    extrusion_speed DECIMAL(6,2) COMMENT '挤压速度',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE IF NOT EXISTS production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT COMMENT '工单ID',
    order_no VARCHAR(50) COMMENT '工单号',
    category_id BIGINT COMMENT '产品类目ID',
    category_name VARCHAR(100) COMMENT '产品类目名称',
    material_cost DECIMAL(12,2) COMMENT '原料成本',
    mold_cost DECIMAL(12,2) COMMENT '模具成本',
    energy_cost DECIMAL(12,2) COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) COMMENT '人工成本',
    scrap_cost DECIMAL(12,2) COMMENT '报废损失',
    total_cost DECIMAL(12,2) COMMENT '总成本',
    output_value DECIMAL(12,2) COMMENT '产值',
    profit DECIMAL(12,2) COMMENT '利润',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产成本表';

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation_type VARCHAR(50) COMMENT '操作类型',
    content VARCHAR(500) COMMENT '操作内容',
    operator VARCHAR(50) COMMENT '操作人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by VARCHAR(50),
    update_by VARCHAR(50),
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, role, status) VALUES
('admin', MD5('123456'), '系统管理员', 5, 1),
('purchaser', MD5('123456'), '张三', 1, 1),
('engineer', MD5('123456'), '李四', 2, 1),
('leader', MD5('123456'), '王五', 3, 1),
('inspector', MD5('123456'), '赵六', 4, 1);

INSERT INTO product_category (category_name, parent_id, level, category_code, description, priority, status) VALUES
('大功率散热器型材', 0, 1, 'RAD', '大功率散热器型材系列', 1, 1),
('设备框架型材', 0, 1, 'FRAME', '设备框架型材系列', 2, 1),
('异形散热条', 0, 1, 'SHAPE', '异形散热条系列', 3, 1),
('新能源专用铝排', 0, 1, 'EV', '新能源专用铝排系列', 4, 1),
('LED散热器', 1, 2, 'RAD-LED', 'LED灯用散热器', 1, 1),
('CPU散热片', 1, 2, 'RAD-CPU', 'CPU散热片', 2, 1);

INSERT INTO aluminum_stock (batch_no, material_type, alloy_grade, specification, quantity, locked_quantity, unit, warning_quantity, stock_status, storage_location, production_date) VALUES
('MAT120250101', 1, '6063-T5', 'Φ120×6000mm', 5000.00, 0, 'kg', 1000, 1, 'A区仓库1号库位', '2025-01-01'),
('MAT120250102', 1, '6061-T6', 'Φ150×6000mm', 3000.00, 0, 'kg', 800, 1, 'A区仓库2号库位', '2025-01-02'),
('MAT120250103', 1, '6063-T6', 'Φ100×6000mm', 800.00, 0, 'kg', 1000, 2, 'B区露天堆场1号', '2025-01-05');
