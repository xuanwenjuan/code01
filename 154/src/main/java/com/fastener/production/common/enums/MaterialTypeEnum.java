package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MaterialTypeEnum {

    STAINLESS_STEEL(1, "不锈钢圆钢"),
    CARBON_STEEL(2, "碳钢线材"),
    ALLOY_STEEL(3, "合金棒料"),
    GALVANIZED_AUXILIARY(4, "镀锌辅料"),
    RUST_PREVENTIVE(5, "防锈助剂");

    private final Integer code;
    private final String name;
}
