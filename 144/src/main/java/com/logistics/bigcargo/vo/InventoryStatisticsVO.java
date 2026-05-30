package com.logistics.bigcargo.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryStatisticsVO {
    private Long totalCount;
    private Long normalCount;
    private Long pendingSortCount;
    private Long nearExpireCount;
    private BigDecimal totalWeight;
    private BigDecimal totalVolume;
    private Long fragileCount;
    private Long expiringCount;
}
