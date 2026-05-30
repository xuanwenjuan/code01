package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OperationTypeEnum {

    CREATE(1, "新增"),
    UPDATE(2, "修改"),
    DELETE(3, "删除"),
    QUERY(4, "查询"),
    STATUS_CHANGE(5, "状态变更"),
    MATERIAL_IN(6, "原料入库"),
    MATERIAL_OUT(7, "原料出库"),
    WORK_ORDER_START(8, "工单启动"),
    WORK_ORDER_PROCESS(9, "工序流转"),
    QUALITY_INSPECTION(10, "质检操作"),
    COST_ACCOUNTING(11, "成本核算"),
    PROCESS_AUDIT(12, "工艺审核"),
    MATERIAL_RESERVE(13, "原料预占"),
    RESERVE_RELEASE(14, "预占释放"),
    DEFECT_SORTING(15, "次品分拣"),
    COST_INVENTORY(16, "成本盘点");

    private final Integer code;
    private final String name;
}
