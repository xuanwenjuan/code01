package com.mining.maintenance.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaintenanceCostStatVO {

    private String miningArea;

    private Long categoryId;

    private String categoryName;

    private Integer totalOrders;

    private Integer completedOrders;

    private BigDecimal totalPartsCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalDowntimeLoss;

    private BigDecimal totalCost;

    private Double avgRepairHours;

    private Double completionRate;
}