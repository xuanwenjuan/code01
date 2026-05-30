package com.foundry.impeller.enums;

import lombok.Getter;

@Getter
public enum MaterialType {
    PIG_IRON("PIG_IRON", "生铁"),
    ALLOY("ALLOY", "合金"),
    FOUNDRY_SAND("FOUNDRY_SAND", "铸造砂"),
    BINDER("BINDER", "粘结剂"),
    QUENCHING("QUENCHING", "淬火助剂");

    private final String code;
    private final String desc;

    MaterialType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
