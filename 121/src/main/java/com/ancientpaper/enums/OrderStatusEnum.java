package com.ancientpaper.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING_SOAK(1, "待浸泡腐熟"),
    SOAKING(2, "浸泡中"),
    PENDING_PULP(3, "待捣料打浆"),
    PULPING(4, "捣料中"),
    PENDING_PAPER(5, "待竹网抄纸"),
    PAPERING(6, "抄纸中"),
    PENDING_DRY(7, "待晾晒脱水"),
    DRYING(8, "晾晒中"),
    PENDING_CALENDER(9, "待砑光整平"),
    CALENDERING(10, "砑光中"),
    PENDING_CUT(11, "待裁切规整"),
    CUTTING(12, "裁切中"),
    PENDING_WAREHOUSE(13, "待入库"),
    FINISHED(14, "已完工入库"),
    FROZEN(15, "已冻结"),
    CANCELLED(16, "已取消");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
