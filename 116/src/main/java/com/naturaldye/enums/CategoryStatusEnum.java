package com.naturaldye.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum CategoryStatusEnum {
    ACTIVE(1, "正常"),
    DISCONTINUED(2, "停产下架");

    @EnumValue
    private final Integer code;
    private final String desc;

    CategoryStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static CategoryStatusEnum fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CategoryStatusEnum status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
