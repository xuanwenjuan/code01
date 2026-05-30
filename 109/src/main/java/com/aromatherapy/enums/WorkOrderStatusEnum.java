package com.aromatherapy.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {

    PENDING("PENDING", "待确认配方"),
    FORMULA_CONFIRMED("FORMULA_CONFIRMED", "配方已确认"),
    MIXING("MIXING", "原液调和中"),
    AGING("AGING", "静置熟化中"),
    QC_PASSED("QC_PASSED", "质检通过"),
    QC_FAILED("QC_FAILED", "质检不合格"),
    PACKAGED("PACKAGED", "已分装"),
    SHIPPED("SHIPPED", "已出库"),
    SUSPENDED("SUSPENDED", "已暂停"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String desc;

    WorkOrderStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
