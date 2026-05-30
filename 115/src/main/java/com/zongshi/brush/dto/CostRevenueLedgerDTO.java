package com.zongshi.brush.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CostRevenueLedgerDTO {
    private Long id;

    private String ledgerNo;

    private LocalDate ledgerDate;

    private Long categoryId;

    private String brushName;

    private Integer productionQuantity;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal processLossCost;

    private BigDecimal totalCost;

    private BigDecimal salesRevenue;

    private BigDecimal profit;

    private String remark;

    private Long orderId;
}
