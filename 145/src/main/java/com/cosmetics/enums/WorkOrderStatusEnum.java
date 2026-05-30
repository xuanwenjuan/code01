package com.cosmetics.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {

    PENDING(1, "待投产"),
    WEIGHING(2, "原料称量"),
    MIXING(3, "混合搅拌"),
    EMULSIFYING(4, "恒温乳化"),
    FILTERING(5, "除菌过滤"),
    FILLING(6, "灌装分装"),
    LABELING(7, "贴标塑封"),
    QC_PENDING(8, "待质检"),
    QC_PASSED(9, "质检合格"),
    WAREHOUSING(10, "成品入库"),
    COMPLETED(11, "已完成"),
    SUSPENDED(0, "已暂停"),
    CANCELLED(-1, "已取消");

    private final Integer code;
    private final String desc;

    WorkOrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static WorkOrderStatusEnum getByCode(Integer code) {
        for (WorkOrderStatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }

    public static WorkOrderStatusEnum getNextStatus(Integer currentCode) {
        if (currentCode >= 1 && currentCode < 11) {
            return getByCode(currentCode + 1);
        }
        return null;
    }
}
