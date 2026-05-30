CREATE DATABASE IF NOT EXISTS battery_shell DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE battery_shell;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(30) NOT NULL COMMENT '角色：PURCHASE-物料采购专员,PROCESS-工艺工程师,LINE-产线班组长,QUALITY-品质管控员,ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用,1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE shell_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    category_type VARCHAR(30) NOT NULL COMMENT '分类类型：POWER-动力电池外壳,ENERGY-储能电池壳,DIGITAL-数码锂电壳,CUSTOM-异形定制电池壳体',
    priority INT DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下线停产,1-正常生产',
    sort_order INT DEFAULT 0 COMMENT '排序',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电池壳体分类表';

CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物料ID',
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(100) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(30) NOT NULL COMMENT '物料类型：ALUMINUM-铝合金板材,STEEL-冷轧防锈钢板,FILM-覆膜防护板材,SEAL-密封配套辅料',
    spec VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) DEFAULT 'KG' COMMENT '单位',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '告警库存数量',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：ENOUGH-充裕备货,WARNING-库存告警,STOP-停止采购',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    is_oxidizable TINYINT DEFAULT 0 COMMENT '是否易氧化：0-否,1-是',
    storage_days INT DEFAULT 30 COMMENT '仓储有效期（天）',
    inbound_time DATETIME COMMENT '入库时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='金属板材物料表';

CREATE TABLE production_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    category_id BIGINT NOT NULL COMMENT '壳体分类ID',
    shell_spec VARCHAR(200) COMMENT '壳体规格',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际生产数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良品数量',
    material_id BIGINT NOT NULL COMMENT '物料ID',
    material_usage DECIMAL(10,2) DEFAULT 0 COMMENT '物料消耗量',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待排产,CUTTING-裁切下料,STAMPING-模具冲压,BENDING-侧边折弯,GRINDING-边角打磨,TESTING-气密性检测,PACKAGING-防锈封装,FINISHED-已完成,PAUSED-已暂停,CANCELLED-已取消',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划完成时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际完成时间',
    operator_id BIGINT COMMENT '负责人ID',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

CREATE TABLE production_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    process_step VARCHAR(30) NOT NULL COMMENT '工序步骤：CUTTING-裁切下料,STAMPING-模具冲压,BENDING-侧边折弯,GRINDING-边角打磨,TESTING-气密性检测,PACKAGING-防锈封装',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    quantity INT COMMENT '本工序数量',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产日志表';

CREATE TABLE cost_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    statistics_date DATE NOT NULL COMMENT '统计日期',
    category_id BIGINT NOT NULL COMMENT '壳体分类ID',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '板材物料成本',
    mold_cost DECIMAL(12,2) DEFAULT 0 COMMENT '模具损耗费用',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '设备能耗费用',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工薪酬费用',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良品损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    production_quantity INT DEFAULT 0 COMMENT '生产数量',
    unit_cost DECIMAL(12,4) DEFAULT 0 COMMENT '单位成本',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_date_category (statistics_date, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表';

CREATE TABLE cost_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    cost_id BIGINT NOT NULL COMMENT '统计ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '物料成本',
    mold_cost DECIMAL(12,2) DEFAULT 0 COMMENT '模具成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良品损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '工单总成本',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本明细表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    operation VARCHAR(100) NOT NULL COMMENT '操作内容',
    module VARCHAR(50) COMMENT '操作模块',
    ip VARCHAR(50) COMMENT 'IP地址',
    request_params TEXT COMMENT '请求参数',
    response_data TEXT COMMENT '响应数据',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '系统管理员', '13800000000', 'ADMIN', 1),
('purchase01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '采购专员张三', '13800000001', 'PURCHASE', 1),
('process01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '工艺工程师李四', '13800000002', 'PROCESS', 1),
('line01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '班组长王五', '13800000003', 'LINE', 1),
('quality01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '品管员赵六', '13800000004', 'QUALITY', 1);
