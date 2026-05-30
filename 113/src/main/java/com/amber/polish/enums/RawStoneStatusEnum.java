package com.amber.polish.enums;

import lombok.Getter;

@Getter
public enum RawStoneStatusEnum {

    PENDING("PENDING", "待打磨"),
    POLISHING("POLISHING", "打磨中"),
    FINISHED("FINISHED", "成品出货"),
    SOLD("SOLD", "已售出");

    private final String code;
    private final String desc;

    RawStoneStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
