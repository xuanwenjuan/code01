package com.fastener.production.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum WorkOrderStatusEnum {

    PENDING(0, "待开始"),
    CUTTING(1, "拉直切断"),
    COLD_HEADING(2, "冷镦成型"),
    THREAD_ROLLING(3, "螺纹滚压"),
    GALVANIZING(4, "表面镀锌"),
    QUENCHING(5, "淬火调质"),
    INSPECTION(6, "尺寸全检"),
    PACKAGING(7, "防锈打包"),
    FINISHED(8, "成品入库"),
    FROZEN(9, "已冻结"),
    CANCELLED(10, "已取消");

    private final Integer code;
    private final String name;
}
