package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PermissionEnum {

    MATERIAL_VIEW("material:view", "原料查看"),
    MATERIAL_PURCHASE("material:purchase", "物料采购"),
    MATERIAL_INBOUND("material:inbound", "原料入库"),
    MATERIAL_OUTBOUND("material:outbound", "原料出库"),
    MATERIAL_MANAGE("material:manage", "原料管理"),

    CATEGORY_VIEW("category:view", "分类查看"),
    PROCESS_COMPILE("process:compile", "工艺编制"),
    PROCESS_AUDIT("process:audit", "工艺审核"),

    WORKORDER_VIEW("workorder:view", "工单查看"),
    WORKORDER_CREATE("workorder:create", "工单创建"),
    WORKORDER_START("workorder:start", "工单启动"),
    PRODUCTION_MANAGE("production:manage", "产线管理"),

    QUALITY_INSPECTION("quality:inspection", "成品质检"),
    QUALITY_DEFECT("quality:defect", "次品分拣"),

    COST_VIEW("cost:view", "成本查看"),
    COST_MANAGE("cost:manage", "成本管理"),
    COST_REPORT("cost:report", "成本报表"),

    LOG_VIEW("log:view", "日志查看"),

    ADMIN("admin", "管理员");

    private final String code;
    private final String name;
}
