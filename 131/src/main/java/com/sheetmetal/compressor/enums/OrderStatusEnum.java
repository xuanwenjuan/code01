package com.sheetmetal.compressor.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING_SCHEDULE(1, "待排产"),
    SCHEDULED(2, "已排产"),
    CUTTING(3, "剪板中"),
    BENDING(4, "折弯中"),
    PUNCHING(5, "冲孔中"),
    WELDING(6, "点焊中"),
    GRINDING(7, "打磨中"),
    SPRAYING(8, "喷涂中"),
    ASSEMBLING(9, "组装中"),
    INSPECTING(10, "质检中"),
    COMPLETED(11, "已完成"),
    PAUSED(12, "已暂停"),
    CANCELLED(13, "已取消");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static OrderStatusEnum fromCode(Integer code) {
        for (OrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
