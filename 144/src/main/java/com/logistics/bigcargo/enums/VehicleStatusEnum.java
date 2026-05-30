package com.logistics.bigcargo.enums;

import lombok.Getter;

@Getter
public enum VehicleStatusEnum {
    IDLE(1, "空闲"),
    IN_TRANSIT(2, "配送中"),
    MAINTENANCE(3, "维修中");

    private final Integer code;
    private final String desc;

    VehicleStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDesc(Integer code) {
        for (VehicleStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status.getDesc();
            }
        }
        return "未知状态";
    }
}
