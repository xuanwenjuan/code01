package com.snack.processing.common.enums;

import lombok.Getter;

@Getter
public enum ProcessStatusEnum {

    PENDING(1, "待处理"),
    IN_PROGRESS(2, "处理中"),
    COMPLETED(3, "已完成"),
    SKIPPED(4, "已跳过");

    private final Integer code;
    private final String description;

    ProcessStatusEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ProcessStatusEnum getByCode(Integer code) {
        for (ProcessStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
