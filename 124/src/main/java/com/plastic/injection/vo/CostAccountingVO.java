package com.plastic.injection.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CostAccountingVO {

    private Long id;

    private Long orderId;

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal productionQuantity;

    private BigDecimal materialCost;

    private BigDecimal machineCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal energyCost;

    private BigDecimal maintenanceCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal salesPrice;

    private BigDecimal grossProfit;

    private BigDecimal grossProfitMargin;

    private BigDecimal materialLossRate;

    private BigDecimal defectiveRate;

    private LocalDate accountingDate;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
