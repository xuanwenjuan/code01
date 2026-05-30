package com.ancientpaper.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    FORAGE_WORKER(1, "草料采割员"),
    PAPER_CRAFTSMAN(2, "抄纸工匠"),
    WAREHOUSE_MANAGER(3, "库房管存"),
    ADMIN(4, "平台管理员");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}