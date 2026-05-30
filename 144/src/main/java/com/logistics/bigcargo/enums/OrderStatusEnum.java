package com.logistics.bigcargo.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING_STOCK_IN(1, "待入库"),
    STOCK_CHECKING(2, "入库清点"),
    STORE_IN_ZONE(3, "库区存放"),
    PENDING_SORT(4, "待分拣"),
    SORTING(5, "分拣中"),
    PENDING_DISPATCH(6, "待派单"),
    DISPATCHED(7, "已派单"),
    IN_TRANSIT(8, "运输中"),
    PENDING_SIGN(9, "待签收"),
    COMPLETED(10, "已完成"),
    SHELVED(11, "已搁置");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDesc(Integer code) {
        for (OrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status.getDesc();
            }
        }
        return "未知状态";
    }

    public static boolean isValidTransition(Integer current, Integer target) {
        return switch (current) {
            case 1 -> target == 2 || target == 11;
            case 2 -> target == 3 || target == 11;
            case 3 -> target == 4 || target == 11;
            case 4 -> target == 5 || target == 11;
            case 5 -> target == 6 || target == 11;
            case 6 -> target == 7 || target == 11;
            case 7 -> target == 8 || target == 11;
            case 8 -> target == 9 || target == 11;
            case 9 -> target == 10 || target == 11;
            case 11 -> false;
            default -> false;
        };
    }
}
