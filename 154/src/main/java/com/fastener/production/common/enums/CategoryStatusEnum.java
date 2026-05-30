package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CategoryStatusEnum {

    NORMAL(1, "正常生产"),
    DISCONTINUED(2, "停产归档"),
    OUTSOURCING(3, "外协排产");

    private final Integer code;
    private final String name;
}
