package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OperationTypeEnum {

    CREATE("CREATE", "创建"),
    UPDATE("UPDATE", "更新"),
    DELETE("DELETE", "删除"),
    STATUS_CHANGE("STATUS_CHANGE", "状态变更"),
    SETTLE("SETTLE", "结算"),
    LOCK("LOCK", "锁定"),
    UNLOCK("UNLOCK", "解锁");

    private final String code;
    private final String desc;
}
