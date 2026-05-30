package com.bee.equipment.common;

public enum PermissionEnum {

    CATEGORY_VIEW("类目查看"),
    CATEGORY_ADD("类目新增"),
    CATEGORY_EDIT("类目编辑"),
    CATEGORY_DELETE("类目删除"),
    CATEGORY_STATUS("类目状态修改"),

    MATERIAL_VIEW("物料查看"),
    MATERIAL_ADD("物料新增"),
    MATERIAL_EDIT("物料编辑"),
    MATERIAL_DELETE("物料删除"),
    MATERIAL_STATUS("物料状态修改"),

    WORKORDER_VIEW("工单查看"),
    WORKORDER_CREATE("工单创建"),
    WORKORDER_PICK("工单领料"),
    WORKORDER_ASSEMBLE("工单组装"),
    WORKORDER_INSPECT("工单质检"),
    WORKORDER_DELIVER("工单配发"),
    WORKORDER_CANCEL("工单取消"),

    COST_STATISTICS_VIEW("成本统计查看"),
    COST_STATISTICS_GENERATE("成本统计生成"),

    USER_MANAGE("用户管理");

    private final String desc;

    PermissionEnum(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }
}
