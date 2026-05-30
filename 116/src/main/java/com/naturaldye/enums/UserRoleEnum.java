package com.naturaldye.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum UserRoleEnum {
    DYE_MASTER(1, "染料调配师"),
    FABRIC_PURCHASER(2, "布匹采购"),
    WORKSHOP_MANAGER(3, "织造工坊"),
    ADMIN(4, "平台管理员");

    @EnumValue
    private final Integer code;
    private final String desc;

    UserRoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
