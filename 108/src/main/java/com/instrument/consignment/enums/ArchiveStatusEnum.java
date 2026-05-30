package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ArchiveStatusEnum {

    TO_REFURBISH("TO_REFURBISH", "待翻新"),
    REFURBISHING("REFURBISHING", "翻新中"),
    TO_SELL("TO_SELL", "待寄售"),
    SOLD("SOLD", "已售出");

    private final String code;
    private final String desc;

    public static ArchiveStatusEnum getByCode(String code) {
        for (ArchiveStatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
