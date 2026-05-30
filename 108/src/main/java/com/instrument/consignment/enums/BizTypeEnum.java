package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BizTypeEnum {

    CATEGORY("CATEGORY", "类目管理"),
    ARCHIVE("ARCHIVE", "乐器档案"),
    WORK_ORDER("WORK_ORDER", "翻新工单"),
    SHARE("SHARE", "分账管理"),
    STOCK("STOCK", "库存管理");

    private final String code;
    private final String desc;
}
