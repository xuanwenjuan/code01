package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CostTypeEnum {

    MATERIAL(1, "原料耗用"),
    MOLD(2, "模具磨损"),
    ELECTRICITY(3, "机床用电"),
    LABOR(4, "生产工时"),
    SCRAP(5, "报废损耗");

    private final Integer code;
    private final String name;
}
