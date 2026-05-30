package com.leathercraft.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING("PENDING", "待处理"),
    SOFTENING("SOFTENING", "软化脱脂中"),
    SOFTENING_FINISHED("SOFTENING_FINISHED", "软化脱脂完成"),
    TANNING("TANNING", "鞣制浸泡中"),
    TANNING_FINISHED("TANNING_FINISHED", "鞣制浸泡完成"),
    DRYING("DRYING", "风干定型中"),
    DRYING_FINISHED("DRYING_FINISHED", "风干定型完成"),
    COLORING("COLORING", "调色养护中"),
    COLORING_FINISHED("COLORING_FINISHED", "调色养护完成"),
    CUTTING("CUTTING", "裁剪缝制中"),
    CUTTING_FINISHED("CUTTING_FINISHED", "裁剪缝制完成"),
    QC("QC", "质检中"),
    FINISHED("FINISHED", "已完成"),
    SUSPENDED("SUSPENDED", "已暂停"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String desc;

    OrderStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(String code) {
        for (OrderStatusEnum e : values()) {
            if (e.getCode().equals(code)) {
                return e.getDesc();
            }
        }
        return "未知";
    }
}
