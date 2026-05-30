package com.foundry.impeller.enums;

import lombok.Getter;

@Getter
public enum WorkOrderStatus {
    PENDING("PENDING", "待开炉"),
    MELTING("MELTING", "熔炼浇筑中"),
    SAND_MOLDING("SAND_MOLDING", "砂型成型中"),
    COOLING("COOLING", "冷却脱壳中"),
    GRINDING("GRINDING", "粗打磨修整中"),
    BALANCING("BALANCING", "动平衡校正中"),
    ANTIRUST("ANTIRUST", "防锈处理中"),
    FINISHED("FINISHED", "已入库"),
    FROZEN("FROZEN", "已冻结");

    private final String code;
    private final String desc;

    WorkOrderStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static WorkOrderStatus getNextStatus(WorkOrderStatus current) {
        return switch (current) {
            case PENDING -> MELTING;
            case MELTING -> SAND_MOLDING;
            case SAND_MOLDING -> COOLING;
            case COOLING -> GRINDING;
            case GRINDING -> BALANCING;
            case BALANCING -> ANTIRUST;
            case ANTIRUST -> FINISHED;
            default -> null;
        };
    }
}
