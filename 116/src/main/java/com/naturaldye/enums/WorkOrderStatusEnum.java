package com.naturaldye.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum WorkOrderStatusEnum {
    PENDING(1, "待投料"),
    PREPROCESSING(2, "面料预处理"),
    BOILING(3, "染料熬煮调色"),
    DYEING(4, "浸泡匀染"),
    FIXING(5, "固色漂洗"),
    DRYING(6, "晾晒定型"),
    CUTTING(7, "成品裁剪出库"),
    COMPLETED(8, "已完成"),
    PAUSED(9, "已暂停");

    @EnumValue
    private final Integer code;
    private final String desc;

    WorkOrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static WorkOrderStatusEnum fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (WorkOrderStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
