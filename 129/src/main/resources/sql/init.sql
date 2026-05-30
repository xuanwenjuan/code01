CREATE DATABASE IF NOT EXISTS spring_manufacturing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE spring_manufacturing;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) NOT NULL COMMENT '角色：PURCHASER-原料采购,PROCESS-热处理工艺员,LEADER-产线班组长,QUALITY-品质质检员,ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) COMMENT '用户表';

CREATE TABLE spring_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    category_type VARCHAR(50) COMMENT '分类类型：CAR_SUSPENSION-轿车悬架弹簧,TRUCK_LOAD-货车载重弹簧,MOTORCYCLE-摩托车减震弹簧,ENGINEERING-工程机械异形弹簧',
    priority INT DEFAULT 0 COMMENT '优先级（数字越大越优先）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停产下线，1-正常生产',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_parent_id (parent_id)
) COMMENT '弹簧产品类目表';

CREATE TABLE spring_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '原料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(50) UNIQUE COMMENT '原料编码',
    material_type VARCHAR(50) NOT NULL COMMENT '原料类型：CARBON-碳素弹簧钢丝,ALLOY-合金弹簧钢丝,ANTIRUST-防锈镀层钢丝,AUXILIARY-热处理辅助辅料',
    specification VARCHAR(200) COMMENT '规格型号',
    batch_no VARCHAR(100) UNIQUE COMMENT '批次编号',
    quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    unit VARCHAR(20) COMMENT '单位',
    warning_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '预警库存',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '状态：NORMAL-库存充足,WARNING-库存预警,STOP-停止采购',
    is_high_toughness TINYINT DEFAULT 0 COMMENT '是否高韧性钢丝：0-否，1-是',
    moisture_protect_remind TEXT COMMENT '防潮防护提醒',
    supplier VARCHAR(200) COMMENT '供应商',
    incoming_date DATE COMMENT '入库日期',
    expire_date DATE COMMENT '有效期至',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_batch_no (batch_no),
    INDEX idx_status (status)
) COMMENT '弹簧钢丝原料表';

CREATE TABLE production_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    work_order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    category_id BIGINT NOT NULL COMMENT '产品分类ID',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    specification VARCHAR(200) COMMENT '规格型号',
    plan_quantity INT NOT NULL COMMENT '计划数量',
    actual_quantity INT DEFAULT 0 COMMENT '实际完成数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良品数量',
    status VARCHAR(30) DEFAULT 'PENDING' COMMENT '工单状态：PENDING-待排产,STRAIGHTENING-钢丝调直切断,HEATING-高温加热处理,FORMING-数控热卷成型,GRINDING-端面磨平,QUENCHING-淬火回火定型,INSPECTION-压力探伤检测,FINISHED-已完成入库,PAUSED-已暂停',
    priority INT DEFAULT 0 COMMENT '优先级',
    plan_start_date DATE COMMENT '计划开始日期',
    plan_end_date DATE COMMENT '计划结束日期',
    actual_start_date DATETIME COMMENT '实际开始时间',
    actual_end_date DATETIME COMMENT '实际结束时间',
    current_process VARCHAR(50) COMMENT '当前工序',
    process_operator_id BIGINT COMMENT '工序操作人ID',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_no (work_order_no),
    INDEX idx_status (status),
    INDEX idx_plan_start_date (plan_start_date)
) COMMENT '生产工单表';

CREATE TABLE work_order_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_name VARCHAR(100) COMMENT '原料名称',
    batch_no VARCHAR(100) COMMENT '批次号',
    used_quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
    unit VARCHAR(20) COMMENT '单位',
    operator_id BIGINT COMMENT '操作人ID',
    receive_time DATETIME COMMENT '领用时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id)
) COMMENT '工单用料明细表';

CREATE TABLE work_order_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    process_code VARCHAR(50) NOT NULL COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_order INT NOT NULL COMMENT '工序顺序',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    process_quantity INT DEFAULT 0 COMMENT '加工数量',
    defective_quantity INT DEFAULT 0 COMMENT '不良数量',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待开始,PROCESSING-进行中,FINISHED-已完成',
    process_params TEXT COMMENT '工艺参数',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_work_order_id (work_order_id)
) COMMENT '工单工序记录表';

CREATE TABLE production_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    cost_month VARCHAR(7) NOT NULL COMMENT '统计月份（YYYY-MM）',
    category_id BIGINT COMMENT '产品分类ID',
    category_name VARCHAR(100) COMMENT '产品分类名称',
    total_output INT DEFAULT 0 COMMENT '总产量',
    material_cost DECIMAL(12,2) DEFAULT 0 COMMENT '原料成本',
    energy_cost DECIMAL(12,2) DEFAULT 0 COMMENT '能耗成本',
    mold_cost DECIMAL(12,2) DEFAULT 0 COMMENT '模具损耗成本',
    labor_cost DECIMAL(12,2) DEFAULT 0 COMMENT '人工成本',
    defective_cost DECIMAL(12,2) DEFAULT 0 COMMENT '不良品报废损失',
    total_cost DECIMAL(12,2) DEFAULT 0 COMMENT '总成本',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '单位成本',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_month_category (cost_month, category_id)
) COMMENT '生产成本统计表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '操作人用户名',
    real_name VARCHAR(50) COMMENT '操作人真实姓名',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_url VARCHAR(200) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    cost_time BIGINT COMMENT '耗时（毫秒）',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败，1-成功',
    error_msg TEXT COMMENT '错误信息',
    INDEX idx_user_id (user_id),
    INDEX idx_operation_time (operation_time)
) COMMENT '操作日志表';

INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '13800138000', 'ADMIN', 1),
('purchaser01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张三', '13800138001', 'PURCHASER', 1),
('process01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '李四', '13800138002', 'PROCESS', 1),
('leader01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '王五', '13800138003', 'LEADER', 1),
('quality01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '赵六', '13800138004', 'QUALITY', 1);

INSERT INTO spring_category (category_name, category_code, parent_id, category_type, priority, status, description) VALUES
('轿车悬架弹簧', 'CAR_SUSPENSION', 0, 'CAR_SUSPENSION', 100, 1, '轿车悬架弹簧大类'),
('货车载重弹簧', 'TRUCK_LOAD', 0, 'TRUCK_LOAD', 90, 1, '货车载重弹簧大类'),
('摩托车减震弹簧', 'MOTORCYCLE', 0, 'MOTORCYCLE', 80, 1, '摩托车减震弹簧大类'),
('工程机械异形弹簧', 'ENGINEERING', 0, 'ENGINEERING', 70, 1, '工程机械异形弹簧大类');

INSERT INTO spring_category (category_name, category_code, parent_id, category_type, priority, status, description) VALUES
('前悬架弹簧', 'CAR_FRONT', 1, 'CAR_SUSPENSION', 100, 1, '轿车前悬架弹簧'),
('后悬架弹簧', 'CAR_REAR', 1, 'CAR_SUSPENSION', 95, 1, '轿车后悬架弹簧'),
('重型货车弹簧', 'TRUCK_HEAVY', 2, 'TRUCK_LOAD', 90, 1, '重型货车载重弹簧'),
('轻型货车弹簧', 'TRUCK_LIGHT', 2, 'TRUCK_LOAD', 85, 1, '轻型货车载重弹簧'),
('踏板车弹簧', 'MOTO_SCOOTER', 3, 'MOTORCYCLE', 80, 1, '踏板车减震弹簧'),
('跨骑车弹簧', 'MOTO_STREET', 3, 'MOTORCYCLE', 75, 1, '跨骑车减震弹簧'),
('挖掘机弹簧', 'ENG_EXCAVATOR', 4, 'ENGINEERING', 70, 1, '挖掘机用异形弹簧'),
('起重机弹簧', 'ENG_CRANE', 4, 'ENGINEERING', 65, 1, '起重机用异形弹簧');